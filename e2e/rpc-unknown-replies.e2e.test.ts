import { setupR4bbit } from '../src';
import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';
import path from 'path';

const localUrl = 'amqp://guest:guest@localhost:5672/';

describe('rpc unknown replies tests', () => {
  beforeAll(() => {
    setupR4bbit({
      logger: {
        engine: {
          info: (str: string) => str,
          debug: (str: string) => str,
          error: (str: string) => str,
        },
      },
    });
  });

  it('should send multiple rpc requests and receive multiple replies', async () => {
    const server = await getServer(localUrl);
    const client = await getClient(localUrl);

    const handler: RpcHandler =
      (reply: Reply) => (msg: Record<string, unknown> | string) => {
        const processingTime = 500;
        setTimeout(async () => {
          if (!msg) {
            return;
          }
          await reply(msg);
        }, processingTime);
      };

    const exchangeName = path.basename(__filename);
    const objectMessage = { message: 'OurMessage' };
    const routingKey = path.basename(__filename) + 'testRoutingKey';
    const serverQueueName = path.basename(__filename) + 'testServerQueue';
    const replyQueueName = path.basename(__filename) + 'testReplyQueue';

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

    await server.registerRPCRoute(
      {
        queueName: 'complete-different-queue-123',
        routingKey,
        exchangeName,
      },
      handler,
      {
        replySignature: 'server-3',
      }
    );

    const response = await client.publishMultipleRPC(objectMessage, {
      exchangeName,
      routingKey,
      replyQueueName,
      timeout: 2_000,
      responseContains: {
        content: true,
        headers: true,
        signature: true,
      },
      handler: async (msg) => {
        switch (msg.signature) {
          case 'server-1':
            await new Promise((resolve) =>
              setTimeout(() => resolve(123), 1_000)
            );
            break;
          case 'server-2':
            break;
          default:
            await new Promise((r) => setTimeout(r, 1_000));
        }
      },
    });

    const expectedResults = [
      {
        content: { content: { message: 'OurMessage' } },
        headers: {
          'x-reply-signature': 'server-3',
          'x-send-type': 'json',
          'x-request-id': expect.any(String),
        },
        signature: 'server-3',
      },
      {
        content: { content: { message: 'OurMessage' } },
        headers: {
          'x-reply-signature': 'server-1',
          'x-send-type': 'json',
          'x-request-id': expect.any(String),
        },
        signature: 'server-1',
      },
      {
        content: { content: { message: 'OurMessage' } },
        headers: {
          'x-reply-signature': 'server-2',
          'x-send-type': 'json',
          'x-request-id': expect.any(String),
        },
        signature: 'server-2',
      },
    ];

    (response as unknown as typeof expectedResults).forEach((res) => {
      expect(expectedResults).toContainEqual(res);
    });
  });
});
