import {
  Channel,
  ChannelWrapper,
  ConnectionUrl
} from 'amqp-connection-manager';
import { Options } from 'amqplib';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import { AckHandler, Handler, Reply, RpcHandler } from './server.type';

class Server {
  private channelWrapper?: ChannelWrapper;

  public init = async (
    connectionUrls: ConnectionUrl | ConnectionUrl[],
    options?: InitRabbitOptions
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  async registerRoute(
    queueName: string,
    routingKey: string,
    exchangeName: string,
    handlerFunction: Handler | AckHandler,
    options?: Options.Consume
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

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
      await channel.consume(queueName, onMessage, defaultConsumerOptions);
    });
  }

  async registerRPCRoute(
    queueName: string,
    routingKey: string,
    exchangeName: string,
    handlerFunction: RpcHandler,
    options?: Options.Consume
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const reply: Reply = async (replyMessage, consumedMessage) => {
      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }

      const { replyTo, correlationId } = consumedMessage.properties;

      await this.channelWrapper.sendToQueue(
        replyTo,
        Buffer.from(replyMessage),
        {
          correlationId,
        }
      );

      this.channelWrapper.ack.call(this.channelWrapper, consumedMessage);
    };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, 'topic');
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, routingKey);
      await channel.consume(queueName, handlerFunction(reply), options);
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
