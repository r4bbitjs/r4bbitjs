import { ConsumeMessage } from 'amqplib';
import { HEADER_REPLY_SIGNATURE, ResponseContains } from '../types';
import { prepareResponse } from './prepareResponse';

describe('prepareResponse', () => {
  const signature = 'test-signature';
  const headers = {
    'X-FAKE-HEADER': 'fake-header-value',
    [HEADER_REPLY_SIGNATURE]: signature,
  };
  const content = { content: 'test' };
  const message = {
    content: Buffer.from(JSON.stringify({ content: 'test' })),
    properties: {
      headers,
    },
  } as unknown as ConsumeMessage;

  it('should prepare response with default options', () => {
    // given
    const expectedResponse = { content: JSON.stringify(content) };

    // when
    const preparedResponse = prepareResponse(message);

    // then
    expect(preparedResponse).toEqual(expectedResponse);
  });

  it('should prepare response with signature', () => {
    // given
    const options: ResponseContains = {
      signature: true,
      content: false,
      headers: false,
    };
    const expectedResponse = { signature };

    // when
    const res = prepareResponse(message, options);

    // then
    expect(res).toEqual(expectedResponse);
  });

  it('should prepare response with headers', () => {
    // given
    const options: ResponseContains = {
      signature: false,
      content: false,
      headers: true,
    };
    const expectedResponse = { headers };

    // when
    const res = prepareResponse(message, options);

    // then
    expect(res).toEqual(expectedResponse);
  });

  it('should prepare response with decoded message', () => {
    // given
    const options: ResponseContains = {
      signature: false,
      content: true,
      headers: false,
    };
    const expectedResponse = { content: JSON.stringify(content) };

    // when
    const response = prepareResponse(message, options);

    // then
    expect(response).toEqual(expectedResponse);
  });
});
