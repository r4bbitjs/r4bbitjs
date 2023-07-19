const mockAddSetup = jest.fn();
const consumeMock = jest.fn();
const channelWrapper = {
  addSetup: mockAddSetup,
  consume: consumeMock,
  publish: jest.fn(),
  ack: jest.fn(),
};
const assertMock = jest.fn();

jest.mock('../Common/cache/cache', () => ({
  ConnectionSet: {
    assert: assertMock,
  },
}));
const initRabbitMock = jest.fn().mockReturnValueOnce(channelWrapper);
jest.mock('../Init/init', () => ({
  initRabbit: initRabbitMock,
}));

import { setupR4bbit } from '../Common/setupRabbit/setupRabbit';
import { getServer } from './server';
import { AckHandler, ServerOptions, Handler } from './server.type';

describe('Server tests', () => {
  const connectionUrl = 'fake-connection-url';
  const queueName = 'test-queue';
  const exchangeName = 'test-exchange';
  const routingKey = 'test-routing-key';

  const serverFactory = async (
    options: ServerOptions,
    handlerFunc: Handler | AckHandler
  ) => {
    const server = await getServer(connectionUrl);
    await server.registerRoute(
      { queueName, routingKey, exchangeName },
      handlerFunc,
      options
    );
  };

  beforeEach(() => {
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

  it('should call init during server instantiation', async () => {
    // given
    const options = {
      consumeOptions: {
        noAck: true,
      },
    };
    serverFactory(options, jest.fn());

    // when & then
    expect(initRabbitMock).toHaveBeenCalled();
  });

  it('should add setup while regustering route', async () => {
    // given
    const options: ServerOptions = {
      consumeOptions: {
        noAck: true,
      },
    };
    const handlerFunction = jest.fn();
    // when
    await serverFactory(options, handlerFunction);

    // then
    expect(assertMock).toBeCalledWith(
      channelWrapper,
      exchangeName,
      queueName,
      routingKey
    );
  });

  // message should run the acknowledge function
  it('should trigger handlerFunction on new message', async () => {
    // given
    const options: ServerOptions = {
      consumeOptions: {
        noAck: false,
      },
    };

    const handlerSpy = jest.fn();
    const handlerFunc: AckHandler =
      ({ ack }) =>
      (msg: string | object) => {
        if (!msg) return;
        if (!ack) return;

        try {
          handlerSpy();
          ack();
        } catch (error) {
          console.error(error);
        }
      };

    consumeMock.mockReset();
    consumeMock.mockImplementation((queueName, handler) => {
      handler({
        content: 'test',
        properties: { correlationId: 'test', headers: {} },
      });
    });

    // when
    await serverFactory(options, handlerFunc);

    // then
    expect(handlerSpy).toHaveBeenCalled();
  });

  // it('should throw an error if the message is null', () => {});

  // if message null
  // if in options ack => ack !== undef (with acknowledgment)
  // if in options nack => ack === undef (no acknowledgment)
  // if in options responseContains => prepareResponse
  // if preparedResponse pass to the handlerFunc
});
