import { ConnectionUrl } from 'amqp-connection-manager';
import { Options } from 'amqplib';
import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { AckHandler } from '../src/Server/server.type';
import { testReadyObjects } from './test-objects';
import winston from 'winston';
import { setupR4bbit } from '../src/Common/setupRabbit/setupRabbit';

const handlerFunc: AckHandler =
  ({ ack }) =>
  (msg: string | object) => {
    if (!msg) return;
    if (!ack) return;

    try {
      ack();
    } catch (error) {
      console.log('error', error);
    }
  };

const localUrl = 'amqp://guest:guest@localhost:5672/';
const objectUrl = {
  url: 'amqp://guest:guest@localhost:5672/v1',
};
const objectUrl2: Options.Connect = {
  username: 'guest',
  password: 'guest',
  hostname: 'localhost',
  port: 5672,
  vhost: 'v2',
  locale: 'en_US',
  frameMax: 0x1000,
  heartbeat: 0,
};

const checkMessagesDispatch = async (url: ConnectionUrl | ConnectionUrl[]) => {
  const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  const falseLog = {
    debug: winstonLogger.debug.bind(winstonLogger),
    info: winstonLogger.info.bind(winstonLogger),
    error: winstonLogger.error.bind(winstonLogger),
  };

  setupR4bbit({
    logger: {
      engine: falseLog,
      options: {
        isJson: false,
        isColor: true,
      },
    },
  });
  const server = await getServer(url);
  const client = await getClient(url);

  for (const obj of testReadyObjects) {
    await server.registerRoute(
      {
        queueName: obj.queueName,
        exchangeName: obj.exchangeName,
        routingKey: obj.key,
      },
      handlerFunc,
      {
        consumeOptions: { noAck: false },
        responseContains: { content: true, headers: true },
      }
    );
  }

  setInterval(async () => {
    const message = {
      test: 'test',
      test2: 123,
      test3: {
        test4: 'test4',
        test5: true,
      },
      test6: [1, 2, 3],
      test7: null,
    };
    await client.publishMessage(message, {
      exchangeName: 'exchange1',
      routingKey: 'something.test2',
      sendType: 'json',
    });
  }, 1_000);
};

(async () => {
  const connectionObjects = [
    'amqp://localhost',
    localUrl,
    objectUrl,
    objectUrl2,
  ];

  await checkMessagesDispatch(connectionObjects);
})();
