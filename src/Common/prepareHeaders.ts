import { HEADER_SEND_TYPE, HEADER_RECEIVE_TYPE, MessageType } from './types';
import {} from './types';

export const prepareHeaders = (
  { isServer }: { isServer: boolean },
  sendType?: MessageType,
  receiveType?: MessageType
) => {
  const defaultMsgType = 'json';

  if (isServer) {
    return {
      [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    };
  }

  return {
    [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    [HEADER_RECEIVE_TYPE]: receiveType ?? defaultMsgType,
  };
};
