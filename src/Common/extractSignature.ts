import { ConsumeMessage } from 'amqplib';
import { HEADER_REPLY_SIGNATURE } from './types';

export const extractSignature = (consumeMessage: ConsumeMessage | null) => {
  return consumeMessage?.properties.headers[HEADER_REPLY_SIGNATURE];
};
