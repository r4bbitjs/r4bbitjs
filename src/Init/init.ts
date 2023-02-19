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

   * functor -> factory
   * auto ACK
   * give possible options in all optional places
   * split the code between client and server
   * e2e tests 
   * ZOD validation 
*/


export const publishMessage = (channelWrapper: ChannelWrapper) => async (exchangeName: string, key: string, message: string) => {
  await channelWrapper.publish(exchangeName, key, message, { persistent: true });
};
