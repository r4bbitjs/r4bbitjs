import { getServer, getClient, ServerTypes } from '@r4bbit/r4bbit';

const main = async () => {
  const server = await getServer('amqp://guest:guest@localhost:5672/');
  const client = await getClient('amqp://guest:guest@localhost:5672/');

  const handlerFunc: ServerTypes.AckHandler =
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

  // create a server with one route
  await server.registerRoute(
    {
      queueName: 'simple-test-queue',
      exchangeName: 'simple-test-exchange',
      routingKey: 'simple-test-routing-key',
    },
    handlerFunc,
    {
      consumeOptions: { noAck: false },
      responseContains: { content: true, headers: true },
    }
  );

  await client.publishMessage(
    { content: 'simple-test content' },
    {
      exchangeName: 'simple-test-exchange',
      routingKey: 'simple-test-routing-key',
      sendType: 'json',
    }
  );
};

main();
