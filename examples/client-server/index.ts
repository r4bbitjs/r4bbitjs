import { getServer, getClient, ServerTypes } from 'r4bbit';

const main = async () => {
  const server = await getServer(
    ['amqp://guest:guest@localhost:5672/', 'amqp://fallback@localhost:5672/'],
    {
      connectOptions: {
        // optional (both connectOptions and all its options)
        reconnectTimeInSeconds: 10,
        heartbeatIntervalInSeconds: 10,
        // ...
      },
      createChannelOptions: {
        // optional (both createChannelOptions and all its options)
        name: 'my-channel-name',
        // ...
      },
    }
  );

  const client = await getClient(
    ['amqp://guest:guest@localhost:5672/', 'amqp://fallback@localhost:5672/'],
    {
      connectOptions: {
        // optional (both connectOptions and all its options)
        reconnectTimeInSeconds: 10,
        heartbeatIntervalInSeconds: 10,
        // ...
      },
      createChannelOptions: {
        // optional (both createChannelOptions and all its options)
        name: 'my-channel-name',
        // ...
      },
    }
  );

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
    handlerFunc,
    {
      consumeOptions: {
        noAck: false, // default is true
      },
      loggerOptions: {
        isDataHidden: true, // default is false
      },
      responseContains: {
        content: true, // default is true
        headers: true, // default is false
      },
    }
  );

  await client.publishMessage(
    { content: 'hello world!!!' },
    {
      exchangeName: 'my-exchange',
      routingKey: 'my.routing-key',
      loggerOptions: {
        isDataHidden: false, // default is true,
      },
      sendType: 'json', // default is 'json'
    }
  );
};

main();
