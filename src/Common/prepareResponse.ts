import { ConsumeMessage } from 'amqplib';
import { decodeMessage } from './decodeMessage';
import { extractHeaders } from './extractHeaders';
import { extractSignature } from './extractSignature';
import { ResponseContains } from './types';

export const prepareResponse = (
  consumeMessage: ConsumeMessage | null,
  responseContains: ResponseContains | undefined
) => {
  const {
    signature = false,
    content = true,
    headers = false,
  } = responseContains || {};

  return {
    ...(() => {
      return signature ? { signature: extractSignature(consumeMessage) } : {};
    })(),
    ...(() => {
      return headers ? { headers: extractHeaders(consumeMessage) } : {};
    })(),
    ...(() => {
      return content ? { content: decodeMessage(consumeMessage) } : {};
    })(),
  };
};
