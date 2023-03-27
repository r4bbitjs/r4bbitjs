import { HEADER_SEND_TYPE, HEADER_RECEIVE_TYPE, MessageType } from './types';
import {} from './types';

export const prepareHeaders = (
  sendType?: MessageType,
  receiveType?: MessageType
) => {
  const defaultMsgType = 'json';

  return {
    [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    [HEADER_RECEIVE_TYPE]: receiveType ?? defaultMsgType,
  };
};
