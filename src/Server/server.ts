import { Channel, ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import { AckHandler, Handler, RegisterRouteOptions } from './server.type';


class Server {
  private channelWrapper?: ChannelWrapper;

  public init = async (connectionUrls: ConnectionUrl, options?: InitRabbitOptions): Promise<void> => {

    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  async registerRoute(
    queueName: string,
    key: string,
    exchangeName: string,
    handlerFunction: Handler & AckHandler,
    options: RegisterRouteOptions): Promise<void> {

    const onMessage = options.noAck ?
      handlerFunction({
        ack: this.channelWrapper?.ack,
        nack: this.channelWrapper?.nack
      })
      : handlerFunction;

    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    await this.channelWrapper.addSetup((channel: Channel) => {
      return Promise.all([
        channel.assertExchange(exchangeName, 'topic'),
        channel.assertQueue(queueName),
        channel.bindQueue(queueName, exchangeName, key),
        channel.consume(queueName, onMessage, { noAck: true })
      ]);
    });
  }
}

let server: Server;
export const getServer = async (connectionUrls: ConnectionUrl, options?: InitRabbitOptions) => {
  if (!server) {
    server = new Server();
    await server.init(connectionUrls, options);
  }

  return server;
};