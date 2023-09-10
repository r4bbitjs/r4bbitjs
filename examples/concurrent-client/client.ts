import { getClient } from 'r4bbit';

const main = async () => {
  const client = await getClient('amqp://guest:guest@localhost:5672/');

  client.publishRPCMessage(
    { message: 'OurMessage', nested: { value: 15 } },
    {
      exchangeName: 'my-exchange',
      routingKey: 'my.routing-key',
      replyQueueName: 'simple-rpc-reply',
      timeout: 500_000,
      responseContains: {
        content: true,
        headers: true,
        signature: true,
      },
    }
  );
  client.publishRPCMessage(
    { message: 'OurMessage', nested: { value: 15 } },
    {
      exchangeName: 'my-exchange',
      routingKey: 'my.routing-key',
      replyQueueName: 'simple-rpc-reply',
      timeout: 500_000,
      responseContains: {
        content: true,
        headers: true,
        signature: true,
      },
    }
  );
};

main();
