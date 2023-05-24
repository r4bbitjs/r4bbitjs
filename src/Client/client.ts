import { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { encodeMessage } from '../Common/encodeMessage/encodeMessage';
import { prepareResponse } from '../Common/prepareResponse/prepareResponse';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import {
  ClientOptions,
  ClientRPCOptions,
  ClientObservable,
  ClientMultipleRPC,
} from './client.type';
import { prepareHeaders } from '../Common/prepareHeaders/prepareHeaders';
import { Subscription, Subject, Observer } from 'rxjs';
import { ConnectionSet } from '../Common/cache/cache';
import {
  logMqPublishMessage,
  logMqPublishError,
  logMqMessageReceivedError,
  logMqMessageReceived,
  logMqTimeoutError,
  logMultipleRepliesReceived,
  logMqClose,
} from '../Common/logger/utils/logMqMessage';

const DEFAULT_TIMEOUT = 30_000;

export class Client {
  private _channelWrapper?: ChannelWrapper;
  private eventEmitter = new EventEmitter();
  private messageMap = new Map<string, Subject<unknown>>();

  public init = async (
    connectionUrls: ConnectionUrl[] | ConnectionUrl,
    options?: InitRabbitOptions
  ): Promise<void> => {
    this._channelWrapper = await initRabbit(connectionUrls, options);
  };

  get channelWrapper() {
    if (!this._channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    return this._channelWrapper;
  }

  public async publishMessage(
    message: Buffer | string | unknown,
    options: ClientOptions
  ) {
    const { exchangeName, routingKey } = options;
    await ConnectionSet.assert(this.channelWrapper, exchangeName, '', '');

    try {
      logMqPublishMessage(message, 'Client');
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders({
            isServer: false,
            sendType: options?.sendType,
          }),
          ...options?.publishOptions,
        }
      );
    } catch (e: unknown) {
      logMqPublishError(message, 'Client');
      throw e;
    }
  }

  public async publishRPCMessage<ResponseType>(
    message: Buffer | string | unknown,
    options: ClientRPCOptions
  ): Promise<ResponseType> {
    const { exchangeName, replyQueueName, routingKey } = options;
    const prefixedReplyQueueName = `reply.${replyQueueName}`;

    const clientConsumeFunction = (msg: ConsumeMessage | null) => {
      logMqMessageReceived(prepareResponse(msg), 'Rpc Client');
      this.eventEmitter.emit(
        msg?.properties.correlationId,
        prepareResponse(msg, options?.responseContains)
      );
    };

    await ConnectionSet.assert(
      this.channelWrapper,
      exchangeName,
      prefixedReplyQueueName,
      prefixedReplyQueueName
    );

    try {
      await this.channelWrapper.consume(
        prefixedReplyQueueName,
        clientConsumeFunction,
        {
          ...options?.consumeOptions,
          noAck: true,
        }
      );
    } catch (err: unknown) {
      logMqMessageReceivedError(message, 'Rpc Client');
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const corelationId = uuidv4();

      const listener = (msg: ConsumeMessage) => {
        clearTimeout(timeout);
        resolve(msg as ResponseType);
      };
      const emitter = this.eventEmitter.once(String(corelationId), listener);

      const timeoutValue = options?.timeout ?? DEFAULT_TIMEOUT;
      const timeout = setTimeout(() => {
        emitter.removeListener(String(corelationId), listener);
        const timeoutMessage = `Timeout of ${timeoutValue}ms occured for the given rpc message`;
        logMqTimeoutError(message, 'Rpc Client', timeoutMessage);
        reject(timeoutMessage);
      }, timeoutValue);
      logMqPublishMessage(message, 'Rpc Client');
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders({
            isServer: false,
            sendType: options?.sendType,
            receiveType: options?.receiveType,
          }),
          ...options?.publishOptions,
          replyTo: prefixedReplyQueueName,
          correlationId: corelationId,
        }
      );
    }) as Promise<ResponseType>;
  }

  private getCorrlationIdSubject<T>(correlationId: string): Subject<T> {
    const subject$ = this.messageMap.get(correlationId) as Subject<T>;
    if (!subject$) {
      throw new Error(
        `No such correlationId in the messageMap ${correlationId}`
      );
    }
    return subject$;
  }

  private removeSubject(correlationId: string, subscription: Subscription) {
    this.messageMap.get(correlationId)?.unsubscribe();
    subscription.unsubscribe();
    this.messageMap.delete(correlationId);
  }

  public async publishMultipleRPC(
    message: Buffer | string | unknown,
    options: ClientMultipleRPC
  ) {
    const { exchangeName, replyQueueName, routingKey } = options;
    const prefixedReplyQueueName = `reply.${replyQueueName}`;

    const corelationId = uuidv4();
    this.messageMap.set(corelationId, new Subject());

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const allReplies: unknown[] = [];

      const clientConsumeFunction = (msg: ConsumeMessage | null) => {
        logMqMessageReceived(message, 'Rpc Client');
        this.getCorrlationIdSubject(msg?.properties.correlationId).next(
          prepareResponse(msg, options?.responseContains)
        );
      };

      // eslint-disable-next-line prefer-const
      let subscription: Subscription;

      const observer: Observer<ClientObservable> = {
        next: (data) => {
          allReplies.push(data);

          if (allReplies.length === options?.waitedReplies) {
            logMultipleRepliesReceived(allReplies);
            resolve(allReplies);
          }

          options.handler && options.handler(data);
        },
        // currently no errorous case
        error: (error: Error) => {
          reject(error);
          this.removeSubject(corelationId, subscription);
        },
        complete: () => {
          logMultipleRepliesReceived(allReplies);
          resolve(allReplies);
          this.removeSubject(corelationId, subscription);
        },
      };

      setTimeout(() => {
        this.getCorrlationIdSubject(corelationId).complete();
      }, options?.timeout || DEFAULT_TIMEOUT);

      subscription =
        this.getCorrlationIdSubject<ClientObservable>(corelationId).subscribe(
          observer
        );

      await ConnectionSet.assert(
        this.channelWrapper,
        exchangeName,
        prefixedReplyQueueName,
        prefixedReplyQueueName
      );

      await this.channelWrapper.consume(
        prefixedReplyQueueName,
        clientConsumeFunction,
        {
          ...options?.consumeOptions,
          noAck: true,
        }
      );

      logMqPublishMessage(message, 'Rpc Client');
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders({
            isServer: false,
            sendType: options?.sendType,
            receiveType: options?.receiveType,
          }),
          ...options?.publishOptions,
          replyTo: prefixedReplyQueueName,
          correlationId: corelationId,
        }
      );
    });
  }

  public async close() {
    logMqClose('Client');
    await this.channelWrapper.cancelAll();
    await this.channelWrapper.close();
  }
}

let client: Client;
export const getClient = async (
  connectionUrls: ConnectionUrl | ConnectionUrl[],
  options?: InitRabbitOptions
) => {
  if (!client) {
    client = new Client();
    await client.init(connectionUrls, options);
  }

  return client;
};
