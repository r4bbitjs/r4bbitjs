import {
  HEADER_SEND_TYPE,
  HEADER_RECEIVE_TYPE,
  MessageType,
  HEADER_REPLY_SIGNATURE,
} from './types';

export const prepareHeaders = (
  { isServer, signature }: { isServer: boolean; signature?: string },
  sendType?: MessageType,
  receiveType?: MessageType
) => {
  const defaultMsgType = 'json';

  if (isServer) {
    return {
      ...(() => (signature ? { [HEADER_REPLY_SIGNATURE]: signature } : {}))(),
      [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    };
  }

  return {
    [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    [HEADER_RECEIVE_TYPE]: receiveType ?? defaultMsgType,
  };
};
