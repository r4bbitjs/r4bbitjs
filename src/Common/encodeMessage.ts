import { MessageType } from './types';

export const encodeMessage = (message: unknown, messageType?: MessageType) => {
  switch (messageType) {
    case 'json':
      return JSON.stringify(message);
    case 'string':
      return String(message);
    case 'object':
      if (
        message &&
        typeof message === 'object' &&
        'toString' in message &&
        typeof message.toString === 'function' &&
        message.toString()
      ) {
        return message.toString();
      }
      throw new Error(
        'Message is not an object that implements toString method'
      );
    default:
      return JSON.stringify(message);
  }
};
