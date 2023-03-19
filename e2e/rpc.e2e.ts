import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';

const localUrl = 'amqp://guest:guest@localhost:5672/';

(async () => {
  const server = await getServer(localUrl);
  const client = await getClient(localUrl);

  const handler: RpcHandler =
    (reply: Reply) => (msg: Record<string, unknown>) => {
      const processingTime = 500;
      setTimeout(async () => {
        if (!msg) {
          return;
        }
        await reply({test: "test"});
      }, processingTime);
    };

  const exchangeName = 'testExchange';
  const message = 'OurMessage';
  const routingKey = 'testRoutingKey';
  const serverQueueName = 'testServerQueue';
  const replyQueueName = 'testReplyQueue';

  await server.registerRPCRoute(
    {
      queueName: serverQueueName,
      routingKey,
      exchangeName,
    },
    handler
  );

  const response = await client.publishRPCMessage(message, {
    exchangeName,
    routingKey,
    replyQueueName,
  });


  console.log('response', response);
  console.log('content', (response as { content: string }).content.toString());
})();