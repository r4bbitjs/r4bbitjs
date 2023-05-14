import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { logger } from '../logger/logger';

export const listenSignals = (connection: IAmqpConnectionManager): void => {
  listenSystemSignals();
  listenConnectionSignals(connection);
};

const listenSystemSignals = (): void => {
  const signals = ['SIGHUP', 'SIGINT', 'SIGTERM'] as const;
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.debug(`👋 Gracefully Closing ${signal}`);
      graceful();
    });
  });
};

const listenConnectionSignals = (connection: IAmqpConnectionManager): void => {
  connection.on('connect', (data) => {
    logger.debug(`✅ Rabbit Connection Established: ${data.url}`);
  });

  connection.on('connectFailed', (err) => {
    logger.error(`❌ Rabbit Connection Failed: ${err}`);
  });

  connection.on('disconnect', (err) => {
    logger.error(`❌ Rabbit Connection Disconnected: ${err}`);
  });

  connection.on('blocked', (err) => {
    logger.error(`❌ Rabbit Connection Blocked: ${err}`);
  });

  connection.on('unblocked', () => {
    logger.error(`✅ Rabbit Connection Unblocked`);
  });
};

const graceful = () => {
  // TODO
};
