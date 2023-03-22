import { MessagePropertyHeaders } from 'amqplib';

export type MessageHeaders = {
  replyExchangeName: string;
} | MessagePropertyHeaders;

export type MessageType = 'json' | 'string' | 'object';

export const HEADER_SEND_TYPE = 'x-send-type';
export const HEADER_RECEIVE_TYPE = 'x-receive-type';