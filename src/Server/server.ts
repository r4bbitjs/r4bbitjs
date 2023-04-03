import {
  Channel,
  ChannelWrapper,
  ConnectionUrl,
} from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';
import { decodeMessage } from '../Common/decodeMessage';
import { encodeMessage } from '../Common/encodeMessage';
import { prepareHeaders } from '../Common/prepareHeaders';
import { HEADER_RECEIVE_TYPE } from '../Common/types';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import {
  AckHandler,
  Handler,
  RpcHandler,
  ServerConnection,
  ServerRPCOptions,
} from './server.type';

class Server {
  private channelWrapper?: ChannelWrapper;

  public init = async (
    connectionUrls: ConnectionUrl | ConnectionUrl[],
    options?: InitRabbitOptions
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  async registerRoute(
    connection: ServerConnection,
    handlerFunction: Handler | AckHandler,
    options?: Options.Consume
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const { exchangeName, queueName, routingKey } = connection;

    const simpleAck = (consumeMessage: ConsumeMessage): (() => void) => {
      return () => this.channelWrapper?.ack(consumeMessage);
    };

    const simpleNack = (consumeMessage: ConsumeMessage): (() => void) => {
      return () => this.channelWrapper?.nack(consumeMessage);
    };

    const defaultConsumerOptions = options ?? { noAck: false };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, 'topic');
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, routingKey);
      await channel.consume(
        queueName,
        (msg) => {
          if (msg === null) {
            throw new Error(
              'Channel has ben canceled,' +
                ' ref:' +
                ' https://amqp-node.github.io/amqplib/channel_api.html' +
                '#channel_consume'
            );
          }

          const onMessage = !options?.noAck
            ? (handlerFunction as AckHandler)({
                ack: simpleAck(msg),
                nack: simpleNack(msg),
              })
            : (handlerFunction as Handler);

          const decoded = decodeMessage(msg);
          return onMessage(decoded);
        },
        defaultConsumerOptions
      );
    });
  }

  async registerRPCRoute(
    connection: ServerConnection,
    handlerFunction: RpcHandler,
    options?: ServerRPCOptions
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }
    console.log('I am called 1');

    const { exchangeName, queueName, routingKey } = connection;

    const reply =
      (consumedMessage: ConsumeMessage | null) =>
      async (replyMessage: Record<string, unknown> | string) => {
        console.log('I am called in consume func');
        if (!this.channelWrapper) {
          throw new Error('You have to trigger init method first');
        }

        if (!consumedMessage) {
          throw new Error('Consume message cannot be null');
        }

        const { replyTo, correlationId } = consumedMessage.properties;

        const receiveType =
          consumedMessage.properties.headers[HEADER_RECEIVE_TYPE];

        await this.channelWrapper.publish(
          exchangeName,
          replyTo,
          encodeMessage(replyMessage, receiveType),
          {
            ...options?.publishOptions,
            correlationId,
            headers: prepareHeaders({ isServer: true }, receiveType),
          }
        );

        this.channelWrapper.ack.call(this.channelWrapper, consumedMessage);
      };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, 'topic');
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, routingKey);
      await channel.consume(
        queueName,
        (consumeMessage) => {
          const decoded = decodeMessage(consumeMessage);
          return handlerFunction(reply(consumeMessage))(decoded);
        },
        options?.consumeOptions
      );
    });
  }
}

let server: Server;
export const getServer = async (
  connectionUrls: ConnectionUrl | ConnectionUrl[],
  options?: InitRabbitOptions
) => {
  if (!server) {
    server = new Server();
    await server.init(connectionUrls, options);
  }

  return server;
};
