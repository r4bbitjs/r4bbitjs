import { extractHeaders } from './extractHeaders';
import { ConsumeMessage } from 'amqplib';

describe('extractHeaders', () => {
  it('Should extract the headers', () => {
    // given
    const expectedHeader = 'test';
    const consumeMessage = {
      properties: {
        headers: expectedHeader,
      },
    } as unknown as ConsumeMessage;

    // when
    const extractedHeader = extractHeaders(consumeMessage);

    // then
    expect(extractedHeader).toEqual(expectedHeader);
  });

  it('Should return undefined for a null message', () => {
    // given
    const msg: ConsumeMessage | null = null;

    // when
    const extractedHeader = extractHeaders(msg);

    // then
    expect(extractedHeader).toBeUndefined();
  });
});
