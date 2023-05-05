import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';
import { getClient } from '../src/Client/client';

describe('e2e tests', () => {
  it('should register a basic route and receive a message', async () => {
    const localUrl = 'amqp://guest:guest@localhost:1883/';
    const server = await getServer(localUrl);
    const client = await getClient(localUrl);

    const handler: RpcHandler =
      (reply: Reply) => (msg: Record<string, unknown> | string) => {
        const processingTime = 500;
        setTimeout(async () => {
          if (!msg) {
            return;
          }
          await reply((msg as { content: string }).content);
        }, processingTime);
      };

    const exchangeName = 'testExchange';
    const objectMessage = { message: 'OurMessage' };
    const routingKey = 'testRoutingKey';
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

    const expectedResponse = {
      content: {
        message: 'OurMessage',
      },
      headers: {
        'x-reply-signature': 'server',
        'x-send-type': 'json',
      },
      signature: 'server',
    };

    expect(response).toEqual(expectedResponse);
  });
});
