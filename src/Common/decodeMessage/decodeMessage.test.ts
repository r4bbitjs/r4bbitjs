import { decodeMessage } from './decodeMessage';
import { ConsumeMessage } from 'amqplib';
import { HEADER_SEND_TYPE } from '../types';

describe('decodeMessage', () => {
  it('should decode a string message', () => {
    // given
    const expectedMessage = 'test';
    const consumeMessage = {
      content: Buffer.from(expectedMessage),
      properties: {
        headers: {
          [HEADER_SEND_TYPE]: 'string',
        },
      },
    } as unknown as ConsumeMessage;

    // when
    const result = decodeMessage(consumeMessage);

    // then
    expect(result).toBe(expectedMessage);
  });

  it('should decode a object message', () => {
    // given
    const expectedSerializecObject = {
      serialized: 'expected serialized value',
    };
    const message = {
      xyz: 'test',
      toString: () => JSON.stringify(expectedSerializecObject),
    };
    const consumeMessage = {
      content: message,
      properties: {
        headers: {
          [HEADER_SEND_TYPE]: 'object',
        },
      },
    } as unknown as ConsumeMessage;

    // when
    const result = decodeMessage(consumeMessage);
    console.log(result);
    // then
    expect(result).toEqual(JSON.stringify(expectedSerializecObject));
  });

  it('should decode a JSON message', () => {
    // given
    const expectedMessage = { xyz: 'test' };
    const consumeMessage = {
      content: Buffer.from(JSON.stringify(expectedMessage)),
      properties: {
        headers: {
          [HEADER_SEND_TYPE]: 'json',
        },
      },
    } as unknown as ConsumeMessage;

    // when
    const result = decodeMessage(consumeMessage);

    // then
    expect(result).toEqual(expectedMessage);
  });
});
