import amqp, { Channel, ChannelWrapper, AmqpConnectionManagerOptions, CreateChannelOpts } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';

export type ConnectionUrl = string[];

export type Bindings = {
  [key: string]: {
    [key: string]: string[];
  };
}

export type InitRabbitOptions = {
  connectOptions?: AmqpConnectionManagerOptions;
  createChannelOptions?: CreateChannelOpts;
}

const handleMessage = (msg: ConsumeMessage | null) => {
  const message = msg?.content.toString();
  console.log('Message received: ', message);
};

export const tempSetup = async (channel: Channel) => {
  channel.assertExchange('exchange1', 'topic', { durable: true }),
  channel.assertQueue('queue1', { durable: true }),
  channel.bindQueue('queue1', 'exchange1', '*.test2'),
  channel.consume('queue1', handleMessage, { noAck: true });
};

export const initRabbit = async (connectionUrls: ConnectionUrl, options?: InitRabbitOptions) => {
  const connection = amqp.connect(connectionUrls, options?.connectOptions);
  const channelWrapper = connection.createChannel(options?.createChannelOptions);

  await channelWrapper.waitForConnect();
  return channelWrapper;
};

export const registerRoute = (channelWrapper: ChannelWrapper) => async (queueName: string, key: string, exchangeName: string): Promise<void> => {
  await channelWrapper.addSetup((channel: Channel) => {
    return Promise.all([
      channel.assertExchange(exchangeName, 'topic', { durable: true }),
      channel.assertQueue(queueName, { durable: true }),
      channel.bindQueue(queueName, exchangeName, key),
      channel.consume(queueName, handleMessage, { noAck: true })
    ]);
  });
};

export const publishMessage = (channelWrapper: ChannelWrapper) => async (exchangeName: string, key: string, message: string) => {
  await channelWrapper.publish(exchangeName, key, message, { persistent: true });
};
