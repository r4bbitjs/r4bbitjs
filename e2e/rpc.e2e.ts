import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';
import { setupR4bbit } from '../src';
import { getReqId, setReqId } from './mock-req-functions';

const localUrl = 'amqp://guest:guest@localhost:5672/';

(async () => {
  setupR4bbit({
    requestTracer: {
      getReqId,
      setReqId,
    },
  });
  const server = await getServer(localUrl);
  const client = await getClient(localUrl);

  const handler: RpcHandler =
    (reply: Reply) => (msg: Record<string, unknown> | string) => {
      const processingTime = 500;
      setTimeout(async () => {
        if (!msg) {
          return;
        }
        console.log('incomin message', msg);
        await reply((msg as { content: string }).content);
      }, processingTime);
    };

  const exchangeName = 'testExchange';
  const objectMessage = { message: 'OurMessage', nested: { value: 15 } };
  const routingKey = 'testRoutingKey.15';
  const serverQueueName = 'testServerQueue';
  const replyQueueName = 'testReplyQueue';

  await server.registerRPCRoute(
    {
      queueName: serverQueueName,
      routingKey: '*.15',
      exchangeName,
    },
    handler,
    {
      replySignature: 'server',
      responseContains: {
        content: true,
        headers: true,
      },
    }
  );

  const response = await client.publishRPCMessage<typeof objectMessage>(
    objectMessage,
    {
      exchangeName,
      routingKey,
      replyQueueName,
      timeout: 5_000,
      responseContains: {
        content: true,
        headers: true,
        signature: true,
      },
    }
  );

  console.log('response', response, typeof response);
})();
