import { getServer, Server } from '../src/Server/server';
import { Reply, RpcHandler } from '../src/Server/server.type';
import { getClient, Client } from '../src/Client/client';
import path from 'path';

describe('e2e tests', () => {
  const localUrl = 'amqp://guest:guest@localhost:5672/';
  let server: Server;
  let client: Client;

  beforeAll(async () => {
    server = await getServer(localUrl);
    client = await getClient(localUrl);
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
      },
      signature: 'server',
    };

    expect(response).toEqual(expectedResponse);
    await server.close();
    await client.close();
  });
});
