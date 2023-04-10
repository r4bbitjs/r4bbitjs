import {
  Channel,
  ChannelWrapper,
  ConnectionUrl,
} from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { encodeMessage } from '../Common/encodeMessage';
import { prepareResponse } from '../Common/prepareResponse';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import {
  ClientConnection,
  ClientConnectionRPC,
  ClientRPCOptions,
  ClientObservable,
  ClientMultipleRPC,
} from './client.type';
import { prepareHeaders } from '../Common/prepareHeaders';
import { Subscription, Subject, Observer } from 'rxjs';

const DEFAULT_TIMEOUT = 30_000;

export class Client {
  private channelWrapper?: ChannelWrapper;
  private eventEmitter = new EventEmitter();

  private messageMap = new Map<string, Subject<unknown>>();

  public init = async (
    connectionUrls: ConnectionUrl[] | ConnectionUrl,
    options?: InitRabbitOptions
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  public decodeMessage(message: string, contentType: string | undefined) {
    if (contentType === 'application/json') {
      return JSON.parse(message);
    }

    return message;
  }

  public async publishMessage(
    connection: ClientConnection,
    message: Buffer | string | unknown,
    options?: ClientRPCOptions
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const { exchangeName, routingKey } = connection;

    await this.channelWrapper.publish(
      exchangeName,
      routingKey,
      encodeMessage(message, options?.sendType),
      {
        headers: prepareHeaders({ isServer: false }, options?.sendType),
        ...options?.publishOptions,
      }
    );
  }

  public async publishRPCMessage<ResponseType>(
    message: Buffer | string | unknown,
    clientConnection: ClientConnectionRPC,
    options?: ClientRPCOptions
  ): Promise<ResponseType> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const { exchangeName, replyQueueName, routingKey } = clientConnection;
    const prefixedReplyQueueName = `reply.${replyQueueName}`;

    const clientConsumeFunction = (msg: ConsumeMessage | null) => {
      this.eventEmitter.emit(
        msg?.properties.correlationId,
        prepareResponse(msg, options?.responseContains)
      );
    };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertQueue(prefixedReplyQueueName);
      await channel.bindQueue(
        prefixedReplyQueueName,
        exchangeName,
        prefixedReplyQueueName
      );
      await channel.consume(prefixedReplyQueueName, clientConsumeFunction, {
        ...options?.consumeOptions,
        noAck: true,
      });
    });

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const corelationId = uuidv4();
      const listener = (msg: ConsumeMessage) => {
        resolve(msg as ResponseType);
      };
      const emitter = this.eventEmitter.once(String(corelationId), listener);

      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }

      setTimeout(() => {
        emitter.removeListener(String(corelationId), listener);
        reject('timeout');
      }, options?.timeout ?? DEFAULT_TIMEOUT);
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders(
            { isServer: false },
            options?.sendType,
            options?.receiveType
          ),
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
    clientConnection: ClientConnectionRPC,
    options: ClientMultipleRPC
  ) {
    const { exchangeName, replyQueueName, routingKey } = clientConnection;
    const prefixedReplyQueueName = `reply.${replyQueueName}`;

    const corelationId = uuidv4();
    this.messageMap.set(corelationId, new Subject());

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const allReplies: unknown[] = [];
      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }

      const clientConsumeFunction = (msg: ConsumeMessage | null) => {
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
            resolve(allReplies);
          }

          options.handler && options.handler(data);
        },
        error: (error: Error) => {
          reject(error);
          this.removeSubject(corelationId, subscription);
        },
        complete: () => {
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

      await this.channelWrapper.addSetup(async (channel: Channel) => {
        await channel.assertQueue(prefixedReplyQueueName);
        await channel.bindQueue(
          prefixedReplyQueueName,
          exchangeName,
          prefixedReplyQueueName
        );
        await channel.consume(prefixedReplyQueueName, clientConsumeFunction, {
          ...options?.consumeOptions,
          noAck: true,
        });
      });

      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          headers: prepareHeaders(
            { isServer: false },
            options?.sendType,
            options?.receiveType
          ),
          ...options?.publishOptions,
          replyTo: prefixedReplyQueueName,
          correlationId: corelationId,
        }
      );
    });
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
