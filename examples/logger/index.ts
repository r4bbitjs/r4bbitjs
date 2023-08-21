import { getServer, getClient, ServerTypes, setupR4bbit } from '@r4bbit/r4bbit';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  transports: [new winston.transports.Console()],
});
const main = async () => {
  // Winston logger example
  setupR4bbit({
    logger: {
      engine: {
        debug: logger.debug.bind(logger),
        info: logger.info.bind(logger),
        error: logger.error.bind(logger),
      },
      options: {
        isJson: true,
      },
    },
  });

  // Default logger with color palette example
  // await setupR4bbit({
  //   logger: {
  //     options: {
  //       isJson: false,
  //       isColor: true,
  //       colors: {
  //         array: '#4B296B',
  //         boolean: '#77867F',
  //         basic: '#87B37A',
  //         key: '#9CE37D',
  //         null: '#7B0828',
  //         number: '#8DAA9D',
  //         string: '#FBF5F3',
  //         undefined: '#C6878F',
  //       },
  //     },
  //   },
  // });

  const server = await getServer('amqp://guest:guest@localhost:5672/');

  const client = await getClient('amqp://guest:guest@localhost:5672/');

  const handlerFunc: ServerTypes.AckHandler =
    ({ ack }) =>
    (msg: string | object) => {
      ack();
      console.log('Received message is ->', msg);
    };

  // create a server with one route
  await server.registerRoute(
    {
      queueName: 'my-queue',
      exchangeName: 'my-exchange',
      routingKey: 'my.*',
    },
    handlerFunc
  );

  await client.publishMessage(
    {
      content: 'hello world!!!',
      numberExp: 123,
      booleanExp: true,
      arrayExp: [1, 2, 3],
      objectExp: { a: 1, b: 2, c: 3 },
      nullExp: null,
      undefinedExp: undefined,
    },
    {
      exchangeName: 'my-exchange',
      routingKey: 'my.routing-key',
    }
  );
};

main();
