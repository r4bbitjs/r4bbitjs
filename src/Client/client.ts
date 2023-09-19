import { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid/async';
import { nanoid as nanoidSync } from 'nanoid';
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
import {
  fetchReqId,
  prepareHeaders,
} from '../Common/prepareHeaders/prepareHeaders';
import { Subscription, Subject, Observer } from 'rxjs';
import { ConnectionSet } from '../Common/cache/cache';
import { logMqClose } from '../Common/logger/utils/logMqMessage';
import { extractAndSetReqId } from '../Common/RequestTracer/extractAndSetReqId';
import { logger } from '../Common/logger/logger';
import { HEADER_REQUEST_ID } from '../Common/types';
import { RequestTracer } from '../Common/RequestTracer/requestTracer';

const DEFAULT_TIMEOUT = 30_000;

export class Client {
  private _channelWrapper?: ChannelWrapper;
  private eventEmitter = new EventEmitter();
  private messageMap = new Map<string, Subject<unknown>>();
  private replyQueueId: string = nanoidSync();

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
    const createdReqId = fetchReqId();

    try {
      const requestTracer = RequestTracer.getInstance();
      requestTracer.setRequestId && requestTracer.setRequestId(createdReqId);

      logger.communicationLog({
        data: message,
        actor: 'Client',
        topic: routingKey,
        isDataHidden: options?.loggerOptions?.isDataHidden,
        action: 'publish',
        requestId: createdReqId,
      });
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders({
            isServer: false,
            sendType: options?.sendType,
            requestId: createdReqId,
          }),
          ...options?.publishOptions,
        }
      );
    } catch (err: unknown) {
      logger.communicationLog({
        level: 'error',
        error: {
          description: '💥 An error occurred while publishing message',
          message: (err as Error).message,
          stack: (err as Error).stack || '',
        },
        data: message,
        actor: 'Client',
        topic: routingKey,
        isDataHidden: options?.loggerOptions?.isDataHidden,
        action: 'publish',
        requestId: createdReqId,
      });
      throw err;
    }
  }

  private clientConsumeFunction =
    (routingKey: string, options: ClientRPCOptions) =>
    (msg: ConsumeMessage) => {
      extractAndSetReqId(msg.properties.headers);
      logger.communicationLog({
        data: prepareResponse(msg, options?.responseContains),
        actor: 'Rpc Client',
        action: 'receive',
        topic: routingKey,
        requestId: msg.properties.headers[HEADER_REQUEST_ID],
        isDataHidden: options?.loggerOptions?.isConsumeDataHidden,
      });
      this.eventEmitter.emit(
        msg?.properties.correlationId,
        prepareResponse(msg, options?.responseContains)
      );
    };

  public async publishRPCMessage<ResponseType>(
    message: Buffer | string | unknown,
    options: ClientRPCOptions
  ): Promise<ResponseType> {
    const { exchangeName, replyQueueName, routingKey } = options;
    const prefixedReplyQueueName = `reply.${replyQueueName}.${this.replyQueueId}`;
    const createdReqId = fetchReqId();
    const requestTracer = RequestTracer.getInstance();
    requestTracer.setRequestId && requestTracer.setRequestId(createdReqId);

    await ConnectionSet.assert(
      this.channelWrapper,
      exchangeName,
      prefixedReplyQueueName,
      prefixedReplyQueueName
    );

    try {
      await this.channelWrapper.consume(
        prefixedReplyQueueName,
        this.clientConsumeFunction(routingKey, options),
        {
          ...options?.consumeOptions,
          noAck: true,
        }
      );
    } catch (err: unknown) {
      logger.communicationLog({
        level: 'error',
        error: {
          description: '💥 An error occurred while receiving message',
          message: (err as Error).message,
          stack: (err as Error).stack || '',
        },
        action: 'receive',
        data: message,
        actor: 'Rpc Client',
        topic: routingKey,
        isDataHidden: options.loggerOptions?.isConsumeDataHidden,
        requestId: createdReqId,
      });
      throw err;
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const corelationId = await nanoid();

      const listener = (msg: ConsumeMessage) => {
        clearTimeout(timeout);
        resolve(msg as ResponseType);
      };
      const emitter = this.eventEmitter.once(String(corelationId), listener);

      const timeoutValue = options?.timeout ?? DEFAULT_TIMEOUT;
      const timeout = setTimeout(() => {
        emitter.removeListener(String(corelationId), listener);

        const timeoutMessage = `Timeout of ${timeoutValue}ms occured for the given rpc message`;
        logger.communicationLog({
          data: message,
          actor: 'Rpc Client',
          topic: routingKey,
          isDataHidden: !!options?.loggerOptions?.isSendDataHidden,
          action: 'publish',
          requestId: createdReqId,
        });

        reject(timeoutMessage);
      }, timeoutValue);

      logger.communicationLog({
        data: message,
        actor: 'Rpc Client',
        topic: routingKey,
        isDataHidden: !!options?.loggerOptions?.isSendDataHidden,
        action: 'publish',
        requestId: createdReqId,
      });
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders({
            isServer: false,
            sendType: options?.sendType,
            receiveType: options?.receiveType,
            requestId: createdReqId,
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
    const prefixedReplyQueueName = `reply.${replyQueueName}.${this.replyQueueId}`;

    const createdReqId = fetchReqId();
    const requestTracer = RequestTracer.getInstance();
    requestTracer.setRequestId && requestTracer.setRequestId(createdReqId);

    const corelationId = await nanoid();
    this.messageMap.set(corelationId, new Subject());

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const allReplies: ClientObservable[] = [];

      const clientConsumeFunction = (msg: ConsumeMessage) => {
        const reqId = extractAndSetReqId(msg.properties.headers);
        logger.communicationLog({
          data: prepareResponse(msg, options?.responseContains),
          actor: 'Rpc Client',
          topic: routingKey,
          isDataHidden: options?.loggerOptions?.isConsumeDataHidden,
          action: 'receive',
          requestId: reqId,
        });

        this.getCorrlationIdSubject(msg?.properties.correlationId).next({
          preparedResponse: prepareResponse(msg, options?.responseContains),
          reqId: reqId,
        });
      };

      // eslint-disable-next-line prefer-const
      let subscription: Subscription;

      const observer: Observer<ClientObservable> = {
        next: (data) => {
          allReplies.push(data);
          options.handler && options.handler(data);

          if (allReplies.length === options?.waitedReplies) {
            this.getCorrlationIdSubject(corelationId).complete();
          }
        },
        error: (error: Error) => {
          reject(error);
          this.removeSubject(corelationId, subscription);
        },
        complete: () => {
          const preparedResponses = allReplies.map(
            (reply: ClientObservable) => reply.preparedResponse
          );
          clearTimeout(timeout);
          resolve(preparedResponses);
          this.removeSubject(corelationId, subscription);
        },
      };

      const timeout = setTimeout(() => {
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

      logger.communicationLog({
        data: message,
        actor: 'Rpc Client',
        topic: routingKey,
        isDataHidden: options?.loggerOptions?.isSendDataHidden,
        action: 'publish',
        requestId: createdReqId,
      });

      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders({
            isServer: false,
            sendType: options?.sendType,
            receiveType: options?.receiveType,
            requestId: createdReqId,
          }),
          ...options?.publishOptions,
          replyTo: prefixedReplyQueueName,
          correlationId: corelationId,
        }
      );
    }).catch((err) => {
      logger.communicationLog({
        level: 'error',
        error: {
          description: '💥 An error occurred while receiving message',
          message: (err as Error).message,
          stack: (err as Error).stack || '',
        },
        action: 'receive',
        data: message,
        actor: 'Rpc Client',
        topic: routingKey,
        isDataHidden: options.loggerOptions?.isConsumeDataHidden,
        requestId: createdReqId,
      });
      throw err;
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
