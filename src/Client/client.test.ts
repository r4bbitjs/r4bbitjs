const mockInitRabbit = jest.fn();

jest.mock('../Init/init');

import { getClient } from './client';

it('should call init during client instantiation', async () => {
  // given
  const connectionUrl = '';
  // when
  await getClient(connectionUrl);

  // then
  expect(mockInitRabbit).toHaveBeenCalled();
});
