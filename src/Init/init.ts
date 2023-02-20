import amqp, { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { InitRabbitOptions } from './init.type';


export const initRabbit = async (connectionUrls: ConnectionUrl, options?: InitRabbitOptions): Promise<ChannelWrapper> => {
  try {
    const connection = amqp.connect(connectionUrls, options?.connectOptions);
    const channelWrapper = connection.createChannel(options?.createChannelOptions);
    await channelWrapper.waitForConnect();
    return channelWrapper;
  } catch (error: unknown) {
    throw new Error(`Error while connecting to RabbitMQ: ${error}`);
  }
};

/*
  TODO: 
   * e2e tests 
   * ZOD validation 
   * initRabbit should accept an array of urls and string of one url
*/
