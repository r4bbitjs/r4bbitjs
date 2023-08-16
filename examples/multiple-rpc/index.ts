import { getServer, getClient, ServerTypes } from '@r4bbit/r4bbit';

const main = async () => {
  const server = await getServer('amqp://guest:guest@localhost:5672/');
  const client = await getClient('amqp://guest:guest@localhost:5672/');

  const handler: ServerTypes.RpcHandler =
    (reply) => (msg: Record<string, unknown> | string) => {
      reply(msg);
    };

  const objectMessage = { message: 'OurMessage' };

  await server.registerRPCRoute(
    {
      queueName: 'queue-1',
      routingKey: 'my.*',
      exchangeName: 'test-exchange',
    },
    handler,
    {
      replySignature: 'server-1',
    }
  );

  await server.registerRPCRoute(
    {
      queueName: 'queue-2',
      routingKey: '*.routing-key',
      exchangeName: 'test-exchange',
    },
    handler,
    {
      replySignature: 'server-2',
    }
  );

  await client.publishMultipleRPC(objectMessage, {
    exchangeName: 'test-exchange',
    routingKey: 'my.routing-key',
    replyQueueName: 'multiple-rpc-client-reply-queue',
    timeout: 5_000,
    waitedReplies: 2,
    responseContains: {
      content: true,
      headers: true,
      signature: true,
    },
    correlationId: 'some-random-nanoid', // optional r4bbit provides a default random value,
    loggerOptions: {
      // optional
      isConsumeDataHidden: false,
      isSendDataHidden: false,
    },
    sendType: 'json', // optional default is 'json',
    receiveType: 'json', // optional default is 'json',
    replySignature: 'server-1', // optional,
  });
};

main();
