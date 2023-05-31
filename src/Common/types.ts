import { MessagePropertyHeaders } from 'amqplib';

export type MessageHeaders =
  | {
      replyExchangeName: string;
    }
  | MessagePropertyHeaders;

export type ResponseContains = {
  signature?: boolean;
  headers?: boolean;
  content?: boolean;
};

export type ServerResponseContains = Omit<ResponseContains, 'signature'>;

export type MessageType = 'json' | 'string' | 'object';

export const HEADER_SEND_TYPE = 'x-send-type';
export const HEADER_RECEIVE_TYPE = 'x-receive-type';
export const HEADER_REPLY_SIGNATURE = 'x-reply-signature';
export const HEADER_REQUEST_ID = 'x-reply-signature';
