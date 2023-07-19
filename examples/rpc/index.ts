import { getServer, getClient, ServerTypes } from '@r4bbit/r4bbit';

const main = async () => {
  const server = await getServer('amqp://guest:guest@localhost:5672/');
  const client = await getClient('amqp://guest:guest@localhost:5672/');

  const handler: ServerTypes.RpcHandler =
    (reply: ServerTypes.Reply) => (msg: Record<string, unknown> | string) => {
      if (!msg) {
        return;
      }
      reply((msg as { content: string }).content);
    };

  const exchangeName = 'simple-rpc-exchange';
  const objectMessage = { message: 'OurMessage', nested: { value: 15 } };
  const routingKey = 'simple-rpc.routing-key';
  const serverQueueName = 'simple-rpc-queue';
  const replyQueueName = 'simple-rpc-reply';

  await server.registerRPCRoute(
    {
      queueName: serverQueueName,
      routingKey: '*.routing-key',
      exchangeName,
    },
    handler,
    {
      replySignature: 'rpc-server-signature',
      responseContains: {
        content: true,
        headers: true,
      },
    }
  );

  await client.publishRPCMessage<typeof objectMessage>(objectMessage, {
    exchangeName,
    routingKey,
    replyQueueName,
    timeout: 5_000,
    responseContains: {
      content: true,
      headers: true,
      signature: true,
    },
  });
};

main();
