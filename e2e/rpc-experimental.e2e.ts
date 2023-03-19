import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';

const localUrl = 'amqp://guest:guest@localhost:5672/';

(async () => {
  const server = await getServer(localUrl);
  const client = await getClient(localUrl);

  const handler: RpcHandler =
    (reply: Reply) => (decoded: Record<string, unknown>) => {
      const processingTime = 500;
      setTimeout(async () => {
        console.log("Decoded: ", decoded);

        await reply({test: "Test"});
      }, processingTime);
    };

  const exchangeName = 'testExchange';
  const message = JSON.stringify({xxx: 'OurMessage'});
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
  setInterval(async () => {
    const response = await client.publishRPCMessage(
      message,
      {
        exchangeName,
        routingKey,
        replyQueueName,
      },
      { contentType: 'application/json', persistent: true, headers: {accept: "application/json"} }
    );

    console.log('response', response);
  }, 5000);
})();
