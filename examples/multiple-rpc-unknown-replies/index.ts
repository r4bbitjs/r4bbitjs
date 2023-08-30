import { getServer, getClient, ServerTypes } from 'r4bbit';

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
  const serverQueueName1 = 'rpc-multiple-queue-1';
  const serverQueueName2 = 'rpc-multiple-queue-2';
  const replyQueueName = 'rpc-multiple-reply-queue';

  await server.registerRPCRoute(
    {
      queueName: serverQueueName1,
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
      queueName: serverQueueName2,
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
    responseContains: {
      content: true,
      headers: true,
      signature: true,
    },
    handler: async (msg) => {
      // Handler is taking actions immediately when reply is received.
      switch (msg.signature) {
        case 'server-1':
          console.log('Server-1 Received:', msg);
          break;
        case 'server-2':
          console.log('Server-2 Received:', msg);
          break;
        default:
          console.log('Unknown resource Received', msg);
      }
    },
  });
};

main();
