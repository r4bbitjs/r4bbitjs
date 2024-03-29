import amqp, { ChannelWrapper, ConnectionUrl } from 'amqp-connection-manager';
import { validateUri } from './connectionUrls.validator';
import { InitRabbitOptions } from './init.type';
import { listenSignals } from '../Common/signals/signal';
import { logger } from '../Common/logger/logger';
import { triggerConsoleWarnWrapper } from '../Common/consoleWarnWrapper/consoleWarnWrapper';

triggerConsoleWarnWrapper();

export const initRabbit = async (
  connectionUrls: ConnectionUrl[] | ConnectionUrl,
  options?: InitRabbitOptions
): Promise<ChannelWrapper> => {
  await validateUri(connectionUrls);

  try {
    const connection = amqp.connect(connectionUrls, options?.connectOptions);
    listenSignals(connection);
    const channelWrapper = connection.createChannel(
      options?.createChannelOptions
    );
    await channelWrapper.waitForConnect();

    return channelWrapper;
  } catch (error: unknown) {
    const errorMsg = `Error while connecting to RabbitMQ: ${error}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};
