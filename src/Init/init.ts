import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';

type ConnectionUrl = string[];

export type Bindings = {
    [key: string]: {
        [key: string]: string[];
    };
}

const handleMessage = (msg: ConsumeMessage | null) => {
  const message = msg?.content.toString();
  console.log('Message received: ', message);
};

export const initRabbit = async (connectionUrls: ConnectionUrl) => {
  const connection = amqp.connect(connectionUrls);
  
  const channelWrapper = connection.createChannel();

  await channelWrapper.waitForConnect();

  return channelWrapper;
};

export const registerRoute = (channelWrapper: ChannelWrapper) => async (queueName: string, key: string, exchangeName: string): Promise<void> => {
  channelWrapper.addSetup((channel: Channel) => {
    return Promise.all([
      channel.assertExchange(exchangeName, 'topic'),
      channel.assertQueue(queueName),
      channel.bindQueue(queueName, exchangeName, key),
      channel.consume(queueName, handleMessage, { noAck: true })
    ]);
  });
};
