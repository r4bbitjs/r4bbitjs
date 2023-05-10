import { MessageType } from '../types';
import { encodeMessage } from './encodeMessage';

describe('encodeMessage', () => {
  it('should encode a json message', () => {
    // given
    const expectedMessage = { test: 'Test' };

    // when
    const encodedMesage = encodeMessage(expectedMessage, 'json');

    // then
    expect(encodedMesage).toEqual(JSON.stringify(expectedMessage));
  });

  it('should encode a string message', () => {
    // given
    const stringMessage = 'test';
    const messageType: MessageType = 'string';

    // when
    const result = encodeMessage(stringMessage, messageType);

    // then
    expect(result).toBe(stringMessage);
  });

  it('should encode an object message', () => {
    // given
    const expectedMessage = { test: 'Test', toString: () => 'test' };

    // when
    const encodedMesage = encodeMessage(expectedMessage, 'object');

    // then
    expect(encodedMesage).toEqual(expectedMessage.toString());
  });

  it('should throw an error when encoding is something without toString method', () => {
    // given
    const expectedMessage = null;

    // when

    // then
    expect(() => encodeMessage(expectedMessage, 'object')).toThrow(
      new Error('Message is not an object that implements toString method')
    );
  });

  it('shoud stringify by default any non specificly supported message', () => {
    // given
    const message = { test: 'Test' };
    const expectedEncodedMessage = JSON.stringify(message);

    // when
    const result = encodeMessage(message);

    // then
    expect(result).toEqual(expectedEncodedMessage);
  });
});
