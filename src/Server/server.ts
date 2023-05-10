import { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { encodeMessage } from '../Common/encodeMessage/encodeMessage';
import { prepareHeaders } from '../Common/prepareHeaders/prepareHeaders';
import { HEADER_RECEIVE_TYPE } from '../Common/types';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import {
  AckHandler,
  Handler,
  RpcHandler,
  ServerConnection,
  ServerRPCOptions,
  ServerOptions,
} from './server.type';
import { ConnectionSet } from '../Common/cache/cache';
import { prepareResponse } from '../Common/prepareResponse/prepareResponse';

export class Server {
  private channelWrapper?: ChannelWrapper;

  public init = async (
    connectionUrls: ConnectionUrl | ConnectionUrl[],
    options?: InitRabbitOptions
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  public getWrapper(): ChannelWrapper {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    return this.channelWrapper;
  }

  async registerRoute(
    connection: ServerConnection,
    handlerFunction: Handler | AckHandler,
    options?: ServerOptions
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

    const defaultConsumerOptions = options?.consumeOptions ?? { noAck: false };
    await ConnectionSet.assert(
      this.channelWrapper,
      exchangeName,
      queueName,
      routingKey
    );

    await this.channelWrapper.consume(
      queueName,
      (msg) => {
        // if message null
        if (msg === null) {
          throw new Error(
            'Channel has ben canceled,' +
              ' ref:' +
              ' https://amqp-node.github.io/amqplib/channel_api.html' +
              '#channel_consume'
          );
        }

        // if in options ack => ack !== undef (with acknowledgment)
        // if in options nack => ack === undef (no acknowledgment)
        const onMessage = !options?.consumeOptions?.noAck
          ? (handlerFunction as AckHandler)({
              ack: simpleAck(msg),
              nack: simpleNack(msg),
            })
          : (handlerFunction as Handler);
        // if in options responseContains => prepareResponse
        const preparedResponse = prepareResponse(
          msg,
          options?.responseContains
        );
        // if preparedResponse pass to the handlerFunc
        return onMessage(preparedResponse);
      },
      defaultConsumerOptions
    );
  }

  async registerRPCRoute(
    connection: ServerConnection,
    handlerFunction: RpcHandler,
    options?: ServerRPCOptions
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const { exchangeName, queueName, routingKey } = connection;

    const reply =
      (consumedMessage: ConsumeMessage | null) =>
      async (replyMessage: Record<string, unknown> | string) => {
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
            headers: prepareHeaders({
              isServer: true,
              signature: options?.replySignature,
              receiveType: receiveType,
            }),
          }
        );

        this.channelWrapper.ack.call(this.channelWrapper, consumedMessage);
      };

    await ConnectionSet.assert(
      this.channelWrapper,
      exchangeName,
      queueName,
      routingKey
    );

    await this.channelWrapper.consume(
      queueName,
      (consumeMessage) => {
        const preparedResponse = prepareResponse(consumeMessage, {
          ...options?.responseContains,
          signature: false,
        });
        return handlerFunction(reply(consumeMessage))(preparedResponse);
      },
      options?.consumeOptions
    );
  }

  async close() {
    const channelWrapper = this.getWrapper();
    await channelWrapper.cancelAll();
    await channelWrapper.close();
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
