import { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { encodeMessage } from '../Common/encodeMessage/encodeMessage';
import { prepareHeaders } from '../Common/prepareHeaders/prepareHeaders';
import { HEADER_RECEIVE_TYPE, HEADER_REQUEST_ID } from '../Common/types';
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
import { logMqClose } from '../Common/logger/utils/logMqMessage';
import { prepareResponse } from '../Common/prepareResponse/prepareResponse';
import { extractAndSetReqId } from '../Common/requestTracer/extractAndSetReqId';
import { logger } from '../Common/logger/logger';

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

    try {
      await ConnectionSet.assert(
        this.channelWrapper,
        exchangeName,
        queueName,
        routingKey
      );

      await this.channelWrapper.consume(
        queueName,
        (msg: ConsumeMessage) => {
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

          extractAndSetReqId(msg.properties.headers);

          // if preparedResponse pass to the handlerFunc
          logger.communicationLog({
            data: preparedResponse,
            actor: 'Server',
            topic: routingKey,
            isDataHidden: options?.loggerOptions?.isDataHidden,
            action: 'receive',
          });
          return onMessage(preparedResponse);
        },
        defaultConsumerOptions
      );
    } catch (err) {
      logger.communicationLog({
        level: 'error',
        error: {
          description: '💥 An error occurred while receiving message',
          message: (err as Error).message,
          stack: (err as Error).stack || '',
        },
        action: 'receive',
        data: {},
        actor: 'Server',
        topic: routingKey,
        isDataHidden: false,
      });
      throw err;
    }
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

        logger.communicationLog({
          data: replyMessage,
          actor: 'Rpc Server',
          topic: replyTo,
          isDataHidden: options?.loggerOptions?.isConsumeDataHidden,
          action: 'publish',
        });
        try {
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
                requestId:
                  consumedMessage.properties.headers[HEADER_REQUEST_ID],
              }),
            }
          );

          this.channelWrapper.ack.call(this.channelWrapper, consumedMessage);
        } catch (err) {
          logger.communicationLog({
            level: 'error',
            error: {
              description: '💥 An error occurred while sending message',
              message: (err as Error).message,
              stack: (err as Error).stack || '',
            },
            action: 'publish',
            data: replyMessage,
            actor: 'Rpc Server',
            topic: routingKey,
            isDataHidden: options?.loggerOptions?.isSendDataHidden,
          });
        }
      };

    await ConnectionSet.assert(
      this.channelWrapper,
      exchangeName,
      queueName,
      routingKey
    );

    try {
      await this.channelWrapper.consume(
        queueName,
        (consumeMessage) => {
          const preparedResponse = prepareResponse(consumeMessage, {
            ...options?.responseContains,
            signature: false,
          });
          logger.communicationLog({
            data: preparedResponse,
            actor: 'Rpc Server',
            topic: routingKey,
            isDataHidden: options?.loggerOptions?.isConsumeDataHidden,
            action: 'receive',
          });
          return handlerFunction(reply(consumeMessage))(preparedResponse);
        },
        options?.consumeOptions
      );
    } catch (err) {
      logger.communicationLog({
        level: 'error',
        error: {
          description: '💥 An error occurred while receiving message',
          message: (err as Error).message,
          stack: (err as Error).stack || '',
        },
        action: 'receive',
        data: {},
        actor: 'Rpc Server',
        topic: routingKey,
        isDataHidden: options?.loggerOptions?.isConsumeDataHidden,
      });
    }
  }

  async close() {
    logMqClose('Server');
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
