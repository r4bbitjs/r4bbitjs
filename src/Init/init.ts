import amqp, { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { validateUri } from './connectionUrls.validator';
import { InitRabbitOptions } from './init.type';

export const initRabbit = async (
  connectionUrls: ConnectionUrl[] | ConnectionUrl,
  options?: InitRabbitOptions
): Promise<ChannelWrapper> => {
  try {
    await validateUri(connectionUrls);
  } catch (err: unknown) {
    throw new Error(
      'Entered uri is not in valid amqp uri format, please check https://www.rabbitmq.com/uri-spec.html' +
        ' ' +
        JSON.stringify(err)
    );
  }

  try {
    const connection = amqp.connect(connectionUrls, options?.connectOptions);
    const channelWrapper = connection.createChannel(
      options?.createChannelOptions
    );
    await channelWrapper.waitForConnect();
    return channelWrapper;
  } catch (error: unknown) {
    throw new Error(`Error while connecting to RabbitMQ: ${error}`);
  }
};
