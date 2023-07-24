import { getServer, Server } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';
import { getClient, Client } from '../src/Client/client';
import path from 'path';
import { setupR4bbit } from '../src';

describe('e2e tests', () => {
  const localUrl = 'amqp://guest:guest@localhost:5672/';
  let server: Server;
  let client: Client;

  beforeAll(async () => {
    setupR4bbit({
      logger: {
        engine: {
          info: (str: string) => str,
          debug: (str: string) => str,
          error: (str: string) => str,
        },
      },
    });
    server = await getServer(localUrl);
    client = await getClient(localUrl);
  });

  afterAll(async () => {
    await server.close();
    await client.close();
  });

  it('should register a basic route and receive a message', async () => {
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
        timeout: 4_000,
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
        'x-request-id': expect.any(String),
      },
      signature: 'server',
    };

    expect(response).toEqual(expectedResponse);
  });
});
