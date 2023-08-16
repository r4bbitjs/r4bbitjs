import { getServer, getClient, ServerTypes } from '@r4bbit/r4bbit';

const main = async () => {
  const server = await getServer('amqp://guest:guest@localhost:5672/');
  const client = await getClient('amqp://guest:guest@localhost:5672/');

  const handler =
    (reply: ServerTypes.Reply) => (msg: Record<string, unknown> | string) => {
      if (!msg) {
        return;
      }
      reply((msg as { content: string }).content);
    };

  await server.registerRPCRoute(
    {
      queueName: 'my-queue',
      exchangeName: 'my-exchange',
      routingKey: 'my.*',
    },
    handler,
    {
      replySignature: 'rpc-server-signature',
      consumeOptions: {
        // optional
        noAck: false, // default is true
      },
      loggerOptions: {
        // optional
        isConsumeDataHidden: true, // default is false
        isSendDataHidden: true, // default is false
      },
      responseContains: {
        content: true, // default is true
        headers: true, // default is false
      },
    }
  );

  await client.publishRPCMessage(
    { message: 'OurMessage', nested: { value: 15 } },
    {
      exchangeName: 'my-exchange',
      routingKey: 'my.routing-key',
      replyQueueName: 'simple-rpc-reply',
      timeout: 5_000,
      responseContains: {
        content: true,
        headers: true,
        signature: true,
      },
    }
  );
};

main();
