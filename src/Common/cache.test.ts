import { ChannelWrapper } from 'amqp-connection-manager';
import { ConnectionSet } from './cache';

describe('Cache tests', () => {
  const mockedChannelWrapper = {
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
  } as unknown as ChannelWrapper;

  it('should create cache for the first time call', async () => {
    const exchangeName = 'testExchange';
    const queueName = 'testQueue';
    const routingKey = 'testRoutingKey';

    await ConnectionSet.assert(
      mockedChannelWrapper,
      exchangeName,
      queueName,
      routingKey
    );

    expect(mockedChannelWrapper.assertExchange).toBeCalledTimes(1);
    expect(mockedChannelWrapper.assertQueue).toBeCalledTimes(1);
    expect(mockedChannelWrapper.bindQueue).toBeCalledTimes(1);
  });

  it('should do assertions just once even if we call it with the same parameters twice', async () => {
    const exchangeName = 'testExchange';
    const queueName = 'testQueue';
    const routingKey = 'testRoutingKey';

    await ConnectionSet.assert(
      mockedChannelWrapper,
      exchangeName,
      queueName,
      routingKey
    );

    await ConnectionSet.assert(
      mockedChannelWrapper,
      exchangeName,
      queueName,
      routingKey
    );

    expect(mockedChannelWrapper.assertExchange).toBeCalledTimes(1);
    expect(mockedChannelWrapper.assertQueue).toBeCalledTimes(1);
    expect(mockedChannelWrapper.bindQueue).toBeCalledTimes(1);
  });
});
