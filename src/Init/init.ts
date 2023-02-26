import amqp, { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { InitRabbitOptions } from './init.type';
import { rabbitUriSchema } from './schema/url.schema';

export const initRabbit = async (
  connectionUrls: ConnectionUrl[] | ConnectionUrl,
  options?: InitRabbitOptions
): Promise<ChannelWrapper> => {
  try {
    if (Array.isArray(connectionUrls)) {
      for (const uri of connectionUrls) {
        await rabbitUriSchema.parseAsync(uri);
      }
    } else {
      await rabbitUriSchema.parseAsync(connectionUrls);
    }
  } catch (err: unknown) {
    if (Array.isArray(err) && err[0].validation === 'regex') {
        throw new Error('Entered uri is not in valid amqp uri format, please check https://www.rabbitmq.com/uri-spec.html')
    }
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

// test if this works
initRabbit(['amqp://[::1]', 'amqp://host/%2f', 'amqp://:10000']);
