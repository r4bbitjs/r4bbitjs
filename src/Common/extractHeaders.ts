import { ConsumeMessage } from 'amqplib';

export const extractHeaders = (consumeMessage: ConsumeMessage | null) => {
  return consumeMessage?.properties.headers;
};
