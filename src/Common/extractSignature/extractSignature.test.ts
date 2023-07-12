import { ConsumeMessage } from 'amqplib';
import { extractSignature } from './extractSignature';
import { HEADER_REPLY_SIGNATURE } from '../types';

describe('extractSignature', () => {
  it('should extract the signature from the ConsumeMessage', () => {
    // given
    const expectedSignature = 'testSignature';
    const msg: ConsumeMessage = {
      properties: {
        headers: {
          [HEADER_REPLY_SIGNATURE]: expectedSignature,
        },
      },
    } as unknown as ConsumeMessage;

    // when
    const extractedSignature = extractSignature(msg);

    // then
    expect(extractedSignature).toEqual(expectedSignature);
  });

  it('should return undefined for a null message', () => {
    // given
    const msg: ConsumeMessage | null = null;

    // when
    const extractedSignature = extractSignature(msg);

    // then
    expect(extractedSignature).toBeUndefined();
  });
});
