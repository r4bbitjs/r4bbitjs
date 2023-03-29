import { ConsumeMessage } from 'amqplib';
import { MessageType } from './types';
import { HEADER_SEND_TYPE } from './types';

export const decodeMessage = (consumeMessage: ConsumeMessage | null) => {
  // After zod validation be sure that it is string and MessageType
  const content = consumeMessage?.content.toString() as string;
  const sendType = consumeMessage?.properties.headers[
    HEADER_SEND_TYPE
  ] as MessageType;

  console.log('context', content);
  console.log('sendType', sendType);

  // TODO: Zod Validation
  switch (sendType) {
    case 'json':
      console.log('will i called 1');
      return JSON.parse(content);
    case 'string':
      console.log('will i called 2');
      return content;
    case 'object':
      console.log('will i called 3');
      return content;
    default:
      console.log('will i called 4');
      return content;
  }
};
