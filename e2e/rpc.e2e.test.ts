import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';
import path from 'path';

describe('rpc e2e tests', () => {
  const localUrl = 'amqp://guest:guest@localhost:5672/';

  it('should register a basic route and receive a message', async () => {
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

    const exchangeName = path.basename(__filename);
    const objectMessage = { message: 'OurMessage' };
    const routingKey = path.basename(__filename) + 'testRoutingKey';
    const serverQueueName = 'testServerQueue';
    const replyQueueName = 'testReplyQueue';

    await server.registerRPCRoute(
      {
        queueName: serverQueueName,
        routingKey,
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
        timeout: 2_000,
        responseContains: {
          content: true,
          headers: true,
          signature: true,
        },
      }
    );

    expect(response).toEqual({
      content: { message: 'OurMessage' },
      headers: { 'x-reply-signature': 'server', 'x-send-type': 'json' },
      signature: 'server',
    });
  });
});
