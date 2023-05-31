import {
  HEADER_SEND_TYPE,
  HEADER_RECEIVE_TYPE,
  MessageType,
  HEADER_REPLY_SIGNATURE,
  HEADER_REQUEST_ID,
} from '../types';
import { RequestTracer } from '../RequestTracer/requestTracer';
import { nanoid } from 'nanoid';

export type HeadersParams = {
  isServer: boolean;
  signature?: string;
  sendType?: MessageType;
  receiveType?: MessageType;
};

const fetchReqId = (): string => {
  const instance = RequestTracer.getInstance();
  return instance.getRequestId ? instance.getRequestId() : nanoid();
};

export const prepareHeaders = (headersParams: HeadersParams) => {
  const defaultMsgType = 'json';
  const { isServer, signature, sendType, receiveType } = headersParams;

  if (isServer) {
    return {
      ...(() => (signature ? { [HEADER_REPLY_SIGNATURE]: signature } : {}))(),
      [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    };
  }

  return {
    [HEADER_SEND_TYPE]: sendType ?? defaultMsgType,
    [HEADER_RECEIVE_TYPE]: receiveType ?? defaultMsgType,
    [HEADER_REQUEST_ID]: fetchReqId(),
  };
};
