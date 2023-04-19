import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';
import { ConnectionUrl } from 'amqp-connection-manager';
import { getClient } from './client';
import { ConnectionSet } from '../Common/cache';
import { EventEmitter } from 'events';
jest.mock('../Init/init', () => ({
  initRabbit: jest.fn(),
}));
jest.mock('../Common/cache', () => ({
  ConnectionSet: {
    assert: jest.fn(),
  },
}));
jest.mock('events', () => ({
  ...jest.requireActual('events'),
  EventEmitter: jest.fn(),
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
  it('should trigger consume method while RPC call', async () => {
    // given
    const channelWrapper = {
      publish: jest.fn(),
      consume: jest.fn(),
    };

    (initRabbit as jest.Mock).mockResolvedValue(channelWrapper);
    let timeout: NodeJS.Timeout;
    (EventEmitter as unknown as jest.Mock).mockReturnValue({
      once: jest.fn().mockImplementation((_, resolve) => {
        timeout = setTimeout(() => {
          resolve('response XYZ');
        }, 2_000);

        return {
          removeListener: () => {
            timeout && clearTimeout(timeout);
          },
        };
      }),
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
    const channelWrapper = {
      publish: jest.fn(),
      consume: jest.fn(),
    };

    (initRabbit as jest.Mock).mockResolvedValue(channelWrapper);
    (EventEmitter as unknown as jest.Mock).mockReturnValue({
      once: jest.fn().mockReturnValue({
        removeListener: jest.fn(),
      }),
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

// publishing RPC - consume should be called
// publishing RPC - timeout (1 msg out of 2)
// publishing RPC - 3 responses out of 2
// publishng RPC - handler + unknown responces case (if handler has been triggered with proper args)
