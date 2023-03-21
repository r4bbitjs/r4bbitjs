import { MessagePropertyHeaders } from 'amqplib';

export type MessageHeaders = {
  replyExchangeName: string;
} | MessagePropertyHeaders;

export type MessageType = 'json' | 'string' | 'object';