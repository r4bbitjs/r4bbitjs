import { getServer, getClient, ServerTypes } from '@r4bbit/r4bbit';

const main = async () => {
  const server = await getServer('amqp://guest:guest@localhost:5672/');
  const client = await getClient('amqp://guest:guest@localhost:5672/');

  const handler: ServerTypes.RpcHandler =
    (reply: ServerTypes.Reply) => (msg: Record<string, unknown> | string) => {
      if (!msg) {
        return;
      }
      reply(msg);
    };

  const exchangeName = 'rpc-multiple-exchange';
  const objectMessage = { message: 'OurMessage' };
  const routingKey = 'rpc-multiple.routing-key';
  const serverQueueName = 'rpc-multiple-queue';
  const replyQueueName = 'rpc-multiple-reply-queue';

  await server.registerRPCRoute(
    {
      queueName: serverQueueName,
      routingKey,
      exchangeName,
    },
    handler,
    {
      replySignature: 'server-1',
    }
  );

  await server.registerRPCRoute(
    {
      queueName: 'complete-different-queue',
      routingKey,
      exchangeName,
    },
    handler,
    {
      replySignature: 'server-2',
    }
  );

  await client.publishMultipleRPC(objectMessage, {
    exchangeName,
    routingKey,
    replyQueueName,
    timeout: 5_000,
    waitedReplies: 2,
    responseContains: {
      content: true,
      headers: true,
      signature: true,
    },
  });
};

main();
