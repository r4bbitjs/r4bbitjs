import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';

const localUrl = 'amqp://guest:guest@localhost:5672/';

const getRandomIntegral = () => Math.floor(Math.random() * 100);

describe('rpc-multiple test', () => {
  it('should handle multiple replays and return array of responses', async () => {
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
          await reply(msg);
        }, processingTime);
      };

    const exchangeName = `exchange-${getRandomIntegral()}`;
    const objectMessage = { message: 'OurMessage' };
    const routingKey = 'testRoutingKey';
    const serverQueueName = `queue-${getRandomIntegral()}`;
    const replyQueueName = `queue-${getRandomIntegral()}`;

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

    const response = await client.publishMultipleRPC(objectMessage, {
      exchangeName,
      routingKey,
      replyQueueName,
      timeout: 2_000,
      waitedReplies: 2,
      responseContains: {
        content: true,
        headers: true,
        signature: true,
      },
    });

    console.log('response', response, typeof response);
    expect(response).toEqual([
      {
        content: { content: { message: 'OurMessage' } },
        headers: { 'x-reply-signature': 'server-2', 'x-send-type': 'json' },
        signature: 'server-2',
      },
      {
        content: { content: { message: 'OurMessage' } },
        headers: { 'x-reply-signature': 'server-1', 'x-send-type': 'json' },
        signature: 'server-1',
      },
    ]);
  });
});