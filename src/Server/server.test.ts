const mockAddSetup = jest.fn();
const mockInitRabbit = jest.fn().mockReturnValueOnce({
  addSetup: mockAddSetup,
});

jest.mock('../Init/init', () => {
  return {
    initRabbit: mockInitRabbit,
  };
});

import { Options } from 'amqplib';
import { getServer } from './server';

describe('Server tests', () => {
  it('should call init during server instantiation', async () => {
    // given
    const connectionUrl = 'fake-connection-url';

    // when
    await getServer(connectionUrl);

    // then
    expect(mockInitRabbit).toHaveBeenCalled();
  });

  it('should add setup while regustering route', async () => {
    // given
    const connectionUrl = 'fake-connection-url';
    const queueName = 'test-queue';
    const exchangeName = 'test-exchange';
    const routingKey = 'test-routing-key';
    const options: Options.Consume = {
      noAck: true,
    };
    const handlerFunction = jest.fn();

    // when
    const server = await getServer(connectionUrl);
    await server.registerRoute(
      queueName,
      routingKey,
      exchangeName,
      handlerFunction,
      options
    );

    // then
    expect(mockAddSetup).toHaveBeenCalledTimes(1);
  });
});
