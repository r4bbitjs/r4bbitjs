import {
  Channel,
  ChannelWrapper,
  ConnectionUrl,
} from 'amqp-connection-manager';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import { AckHandler, Handler } from './server.type';
import { Options } from 'amqplib';

class Server {
  private channelWrapper?: ChannelWrapper;

  public init = async (
    connectionUrls: ConnectionUrl,
    options?: InitRabbitOptions,
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  async registerRoute(
    queueName: string,
    key: string,
    exchangeName: string,
    handlerFunction: Handler | AckHandler,
    options?: Options.Consume,
  ): Promise<void> {
    const onMessage = !options?.noAck
      ? handlerFunction({
        ack,
        nack
      })
      : handlerFunction;

    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const defaultConsumerOptions = options ?? { noAck: false };

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, 'topic');
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, key);
      await channel.consume(queueName, onMessage, defaultConsumerOptions);
    });
  }
}

let server: Server;
export const getServer = async (
  connectionUrls: ConnectionUrl,
  options?: InitRabbitOptions,
) => {
  if (!server) {
    server = new Server();
    await server.init(connectionUrls, options);
  }

  return server;
};
