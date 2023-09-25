import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { logger } from '../logger/logger';
import { ConnectionManager } from '../connectionManager/connectionManager';
import amqp from 'amqp-connection-manager';
import { client } from '../../Client/client';

let connectionBouncer = true;

export const listenSignals = (connection: IAmqpConnectionManager): void => {
  listenSystemSignals();
  listenConnectionSignals(connection);
};

const listenSystemSignals = (): void => {
  const signals = ['SIGHUP', 'SIGINT', 'SIGTERM'] as const;
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.debug(`🐇👋 Gracefully Closing ${signal}`);
      graceful();
    });
  });
};

const listenConnectionSignals = (connection: IAmqpConnectionManager): void => {
  connection.on('connect', async ({ url }) => {
    // send the URL to ConnectionManager, set a flag in it to recreate

    logger.debug(`✅ R4bbit Connection Established:`, url);

    if (connectionBouncer) {
      logger.debug('Am I here ...');
      connectionBouncer = false;
      return;
    }

    logger.debug('Reconnect processing ...');
    const connection = amqp.connect(
      url,
      ConnectionManager.options?.connectOptions
    );

    await client.channelWrapper.close();
    await ConnectionManager.recreate(connection);
    logger.debug(`We're about to delete a queue: ${client.replyQueueName}`);
    // todo: 2s timeouti
    try {
      await client.channelWrapper.deleteQueue(client.replyQueueName);

      logger.debug('Delete queue called');
    } catch (error) {
      logger.error('Deletion err: ', error as unknown as object);
    }
    logger.info('Queue successfully deleted');

    connectionBouncer = true;
  });

  connection.on('connectFailed', (err) => {
    logger.error(`❌ R4bbit Connection Failed:`, err);
  });

  connection.on('disconnect', (err) => {
    logger.error(`❌ R4bbit Connection Disconnected:`, err);
  });

  connection.on('blocked', (err) => {
    logger.error(`❌ R4bbit Connection Blocked:`, err);
  });

  connection.on('unblocked', () => {
    logger.error(`✅ R4bbit Connection Unblocked`);
  });

  // TODO: Add also reconnection issue
  // TODO: add a logic to automatic reconnect
};

const graceful = () => {
  client.close().then(() => process.exit(0));
};
