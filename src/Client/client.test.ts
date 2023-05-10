import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import { ConnectionUrl } from 'amqp-connection-manager';
import { getClient } from './client';
import { ConnectionSet } from '../Common/cache/cache';

jest.mock('../Init/init', () => ({
  initRabbit: jest.fn(),
}));
jest.mock('../Common/cache/cache', () => ({
  ConnectionSet: {
    assert: jest.fn(),
  },
}));
const onceMock = jest.fn();
jest.mock('events', () => ({
  ...jest.requireActual('events'),
  EventEmitter: jest.fn().mockImplementation(() => ({
    once: onceMock,
  })),
}));

const connectionUrls: ConnectionUrl | ConnectionUrl[] = '';
const options: InitRabbitOptions = {};

describe('Client tests', () => {
  const channelWrapper = {
    publish: jest.fn(),
  };

  (initRabbit as jest.Mock).mockResolvedValue(channelWrapper);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should create a new client as a singleton', async () => {
    // when
    await getClient(connectionUrls, options);
    await getClient(connectionUrls, options);

    // then
    expect(initRabbit).toBeCalledTimes(1);
  });

  it('should call assert and publish methods', async () => {
    const client = await getClient(connectionUrls, options);

    // when
    await client.publishMessage('test', {
      exchangeName: 'test',
      routingKey: 'test',
    });

    // then
    expect(ConnectionSet.assert).toBeCalled();
  });
});

describe('RPC tests', () => {
  const channelWrapper = {
    publish: jest.fn(),
    consume: jest.fn(),
  };

  (initRabbit as jest.Mock).mockResolvedValue(channelWrapper);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should trigger consume method while RPC call', async () => {
    // given
    (initRabbit as jest.Mock).mockResolvedValue(channelWrapper);
    let timeout: NodeJS.Timeout;

    onceMock.mockReset();
    onceMock.mockImplementation((_, resolve) => {
      timeout = setTimeout(() => {
        resolve('response XYZ');
      }, 2_000);

      return {
        removeListener: () => {
          timeout && clearTimeout(timeout);
        },
      };
    });
    const message = { message: 'testMessage' };

    // when
    const client = await getClient(connectionUrls, options);
    await client.publishRPCMessage(message, {
      exchangeName: 'test',
      routingKey: 'test',
      replyQueueName: 'test',
      timeout: 3_000,
    });

    // then
    expect(ConnectionSet.assert).toBeCalled();
    expect(channelWrapper.consume).toBeCalled();
  });

  it('should trigger timeout', async () => {
    // given
    (initRabbit as jest.Mock).mockResolvedValue(channelWrapper);
    onceMock.mockReset();
    onceMock.mockReturnValue({
      removeListener: jest.fn(),
    });

    const message = { message: 'testMessage' };

    // when
    const client = await getClient(connectionUrls, options);
    await expect(
      client.publishRPCMessage(message, {
        exchangeName: 'test',
        routingKey: 'test',
        replyQueueName: 'test',
        timeout: 1_000,
      })
    ).rejects.toEqual('timeout of 1000ms occured for the given rpc message');

    // then
    expect(ConnectionSet.assert).toBeCalled();
  });
});
