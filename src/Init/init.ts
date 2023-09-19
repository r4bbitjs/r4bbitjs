import amqp, { ConnectionUrl } from 'amqp-connection-manager';
import { validateUri } from './connectionUrls.validator';
import { InitRabbitOptions } from './init.type';
import { listenSignals } from '../Common/signals/signal';
import { logger } from '../Common/logger/logger';
import { triggerConsoleWarnWrapper } from '../Common/consoleWarnWrapper/consoleWarnWrapper';
import { ConnectionManager } from '../Common/connectionManager/connectionManager';

triggerConsoleWarnWrapper();

export const initRabbit = async (
  connectionUrls: ConnectionUrl[] | ConnectionUrl,
  options?: InitRabbitOptions
) => {
  await validateUri(connectionUrls);

  try {
    const connection = amqp.connect(connectionUrls, options?.connectOptions);
    listenSignals(connection);
    ConnectionManager.setOptions(options);
    await ConnectionManager.recreate(connection);
  } catch (error: unknown) {
    const errorMsg = `Error while connecting to RabbitMQ: ${error}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};
