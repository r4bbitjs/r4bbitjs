import {
  Channel,
  ChannelWrapper,
  ConnectionUrl,
  Options,
} from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import {
  ClientConnection,
  ClientConnectionRPC,
  ClientRPCOptions,
} from './client.type';
import { encodeMessage } from '../Common/encodeMessage';

export class Client {
  private channelWrapper?: ChannelWrapper;
  private eventEmitter = new EventEmitter();

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

  public prepareOptions(options?: ClientRPCOptions): Options.Publish {
    const defaultOptions = { persistent: true };
    const defaultMsgType = 'json';

    return {
      ...defaultOptions,
      ...options?.amqpOptions,
      headers: {
        'x-send-type': options?.sendType ?? defaultMsgType,
        'x-receive-type': options?.receiveType ?? defaultMsgType,
      },
    };
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
      this.prepareOptions(options)
    );
  }

  public async publishRPCMessage(
    message: Buffer | string | unknown,
    clientConnection: ClientConnectionRPC,
    options?: ClientRPCOptions
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const { exchangeName, replyQueueName, routingKey } = clientConnection;
    const prefixedReplyQueueName = `reply.${replyQueueName}`;

    const clientConsumeFunction = (msg: ConsumeMessage | null) => {
      const decoded = this.decodeMessage(
        (msg?.content as Buffer).toString(),
        msg?.properties.contentType
      );
      this.eventEmitter.emit(msg?.properties.correlationId, decoded);
    };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertQueue(prefixedReplyQueueName);
      await channel.bindQueue(
        prefixedReplyQueueName,
        exchangeName,
        prefixedReplyQueueName
      );
      await channel.consume(
        prefixedReplyQueueName,
        clientConsumeFunction,
        this.prepareOptions(options)
      );
    });

    return new Promise(async (resolve, reject) => {
      const corelationId = uuidv4();
      this.eventEmitter.once(String(corelationId), (msg) => {
        resolve(msg);
      });
      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }

      setTimeout(() => {
        reject('timeout');
      }, 30_000);
      await this.channelWrapper.publish(
        exchangeName,
        routingKey,
        encodeMessage(message, options?.sendType),
        {
          ...this.prepareOptions(options),
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
