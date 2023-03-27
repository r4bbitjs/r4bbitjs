const mockPublishFn = jest.fn();
const mockInitRabbit = jest.fn().mockReturnValueOnce({
  publish: mockPublishFn,
});

jest.mock('../Init/init', () => {
  return {
    initRabbit: mockInitRabbit,
  };
});

import { Client, getClient } from './client';

describe('Client object testing', () => {
  it('should call init during client instantiation', async () => {
    // given
    const connectionUrl = 'fake-connection-url';

    // when
    await getClient(connectionUrl);

    // then
    expect(mockInitRabbit).toHaveBeenCalled();
  });

  it('should throw an error when publishMessage is triggerd before init', async () => {
    // given
    const exchangeName = 'test-exchange';
    const key = 'test-key';
    const message = 'test-message';
    const expectedError = new Error('You have to trigger init method first');

    // when & then
    const client = new Client();
    await expect(
      client.publishMessage(exchangeName, key, message)
    ).rejects.toEqual(expectedError);
  });

  it('should publish a message when publishMessage functions is called', async () => {
    // given
    const exchangeName = 'test-exchange';
    const key = 'test-key';
    const message = 'test-message';
    const options = {
      persistent: true,
    };
    const client = await getClient('test-connection-url');

    // when
    client.publishMessage(exchangeName, key, message);

    // then
    expect(mockPublishFn).toHaveBeenCalledWith(
      exchangeName,
      key,
      message,
      options
    );
  });
});
