import { Channel, ChannelWrapper, ConnectionUrl, Options } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';

const REPLY_QUEUE = 'amq.rabbitmq.reply-to';


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

  public async publishRPCMessage(
    exchangeName: string,
    key: string,
    message: Buffer | string | unknown,
    options?: Options.Publish,
    queueName: string = uuidv4()
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const defaultOptions = options ?? { persistent: true };

    const correlationId = 5;

    const clientConsumeFunction = (msg: ConsumeMessage | null) => {
      if (msg?.properties.correlationId !== 'A') {
        return;
      }
      if ()


      
    }

    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertQueue(queueName);
      await channel.bindQueue(queueName, exchangeName, routingKey);
      await channel.consume(queueName, clientConsumeFunction, options);
    });

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
