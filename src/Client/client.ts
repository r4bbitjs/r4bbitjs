import {
  ChannelWrapper, ConnectionUrl, Options
} from 'amqp-connection-manager';
import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';


export class Client {
  private channelWrapper?: ChannelWrapper;

  public init = async (
    connectionUrls: ConnectionUrl[] | ConnectionUrl,
    options?: InitRabbitOptions,
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  public async publishMessage(
    exchangeName: string,
    key: string,
    message: Buffer | string | unknown,
    options?: Options.Publish,
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const defaultOptions = options ?? { persistent: true };

    await this.channelWrapper.publish(exchangeName, key, message, defaultOptions);
  }

  // TODO
  public async publishRPCMessage(
    exchangeName: string,
    key: string,
    message: Buffer | string | unknown,
    options?: Options.Publish,
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const defaultOptions = options ?? { persistent: true };

    await this.channelWrapper.publish(exchangeName, key, message, defaultOptions);
  }
}

let client: Client;
export const getClient = async (
  connectionUrls: ConnectionUrl | ConnectionUrl[],
  options?: InitRabbitOptions,
) => {
  if (!client) {
    client = new Client();
    await client.init(connectionUrls, options);
  }

  return client;
};
