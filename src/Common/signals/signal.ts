import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { logger } from '../logger/logger';
import { client, consumerTags } from '../../Client/client';

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
  connection.on('connect', (data) => {
    logger.debug(`✅ R4bbit Connection Established:`, data.url);
  });

  connection.on('connectFailed', (err) => {
    logger.error(`❌ R4bbit Connection Failed:`, err);
  });

  connection.on('disconnect', async (err) => {
    logger.error(`❌ R4bbit Connection Disconnected:`, err);
    // todXoX: cancelAllConsumers
    //   if (client) {

    // const tags = consumerTags.map((consumerTag) => {
    //   return client.channelWrapper
    //     .cancel(consumerTag)
    //     .then(() => {
    //       console.log('We just cancelled one');
    //     })
    //     .catch((err) => {
    //       console.error(`An err occured ${err}`);
    //     });
    // });

    // await Promise.all(tags);

    // client.channelWrapper['_consumers'] = [];

    consumerTags.forEach((consumerTag) => {
      client.channelWrapper
        .cancel(consumerTag)
        .then(() => {
          console.log('We just cancelled one');
        })
        .catch((err) => {
          console.error(`An err occured ${err}`);
        });
    });
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
  process.exit(-1);
};
