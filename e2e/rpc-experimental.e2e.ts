import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { ConsumeMessage } from 'amqplib';
import { Reply, RpcHandler } from '../src/Server/server.type';

const localUrl = 'amqp://guest:guest@localhost:5672/';

(async () => {
  const server = await getServer(localUrl);
  const client = await getClient(localUrl);

  const handler: RpcHandler =
    (reply: Reply) => (msg: ConsumeMessage | null) => {
      const processingTime = 500;
      setTimeout(async () => {
        if (!msg) {
          return;
        }
        // var message = JSON.parse(msg.content.toString());
        await reply(message, msg);
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
      { contentType: 'application/json', persistent: true }
    );

    console.log('response', response);
    console.log(
      'content',
      (response as { content: string }).content.toString()
    );
  }, 5000);
})();
