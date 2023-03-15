import { MessagePropertyHeaders } from 'amqplib';

export type MessageHeaders = {
  replyExchangeName: string;
} | MessagePropertyHeaders;