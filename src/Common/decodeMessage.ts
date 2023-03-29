import { ConsumeMessage } from 'amqplib';
import { MessageType } from './types';
import { HEADER_SEND_TYPE } from './types';

export const decodeMessage = (consumeMessage: ConsumeMessage | null) => {
  const content = consumeMessage?.content.toString() as string;
  const sendType = consumeMessage?.properties.headers[
    HEADER_SEND_TYPE
  ] as MessageType;

  switch (sendType) {
    case 'json':
      return JSON.parse(content);
    case 'string':
      return content;
    case 'object':
      return content;
    default:
      return content;
  }
};
