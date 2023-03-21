import {
  Channel,
  ChannelWrapper,
  ConnectionUrl
} from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import { AckHandler, Handler, RpcHandler, ServerConnection } from './server.type';
import { encodeMessage } from '../Common/encodeMessage';
import { MessageType } from '../Common/types';

class Server {
  private channelWrapper?: ChannelWrapper;

  public init = async (
    connectionUrls: ConnectionUrl | ConnectionUrl[],
    options?: InitRabbitOptions
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  public decodeMessage(consumeMessage: ConsumeMessage | null) {
    // After zod validation be sure that it is string and MessageType
    const content = consumeMessage?.content.toString() as string;
    const sendType = consumeMessage?.properties.headers['x-send-type'] as MessageType;

    // TODO: Zod Validation
    switch (sendType) {
      case 'json':
        return JSON.parse(content);
      case 'string':
        return content;
      case 'object':
        return content;
      default:
        return content;
    }
  }

  async registerRoute(
    connection: ServerConnection,
    handlerFunction: Handler | AckHandler,
    options?: Options.Consume
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const {exchangeName, queueName, routingKey} = connection;

    const onMessage = !options?.noAck
      ? (handlerFunction as AckHandler)({
          ack: this.channelWrapper.ack.bind(this.channelWrapper),
          nack: this.channelWrapper.nack.bind(this.channelWrapper),
        })
      : (handlerFunction as Handler);

    const defaultConsumerOptions = options ?? { noAck: false };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, 'topic');
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, routingKey);
      await channel.consume(queueName, msg => onMessage(this.decodeMessage(msg)), defaultConsumerOptions);
    });
  }

  async registerRPCRoute(
    connection: ServerConnection,
    handlerFunction: RpcHandler,
    options?: Options.Consume
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const {exchangeName, queueName, routingKey} = connection;

    const reply = (consumedMessage: ConsumeMessage | null) => async (replyMessage: Record<string, unknown>) => {
      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }
      
      if (!consumedMessage){
        throw new Error('Consume message cannot be null');
      }

      const { replyTo, correlationId } = consumedMessage.properties;

      await this.channelWrapper.publish(exchangeName, replyTo, Buffer.from(JSON.stringify(replyMessage)), {
        correlationId,
        contentType: consumedMessage.properties.headers.accept
      });
        
      this.channelWrapper.ack.call(this.channelWrapper, consumedMessage);
    };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, 'topic');
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, routingKey);
      await channel.consume(queueName, consumeMessage => {
        const decoded = this.decodeMessage(consumeMessage);
        return handlerFunction(reply(consumeMessage))(decoded);
      }, options);
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
