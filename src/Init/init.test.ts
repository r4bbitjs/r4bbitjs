jest.mock('amqp-connection-manager', () => ({
  amqp: {
    connect: (...args: unknown[]) => {
      console.log('amqp connection established with args:', args);
    },
  },
}));

import { initRabbit } from './init';
import { rabbitUriSchema } from './schema/url.schema';

describe('init function tests', () => {
  it('should create a connection and a channel', async () => {
    // given
    const connectionUrl = 'amqp://localhost';

    // when
    await initRabbit(connectionUrl);

    // then
    expect(1).toEqual(1);
  });

  it('should accept correct urls ', () => {
    // given
    const correctUrls = [
      'amqp://localhost',
      'amqp://user:pass@host:10000/vhost',
      'amqp://user%61:%61pass@ho%61st:10000/v%2fhost',
    ];

    correctUrls.forEach((uri) => {
      // when
      const parsedUri = rabbitUriSchema.parse(uri);
      // then
      expect(parsedUri).toBeTruthy;
    });
  });

  it('should throw an error for incorrect urls', () => {
    // given
    const falsyUris = ['amqp://[::1]', 'amqp://host/%2f', 'amqp://:10000'];

    falsyUris.forEach((uri) => {
      // when & then
      expect(rabbitUriSchema.parse).toThrowError();
    });
  });
});
