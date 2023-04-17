import { MessageType } from '../Common/types';
import { ResponseContains } from '../Common/types';
import { ServerRPCOptions } from '../Server/server.type';
import { Options } from 'amqplib';

export type ClientOptions = {
  exchangeName: string;
  routingKey: string;
  sendType?: MessageType;
  publishOptions?: Options.Publish;
};

export type ClientRPCOptions = {
  exchangeName: string;
  routingKey: string;
  replyQueueName: string;
  receiveType?: MessageType;
  timeout?: number;
  responseContains?: ResponseContains;
} & ServerRPCOptions;

export type ClientMultipleRPC = {
  exchangeName: string;
  routingKey: string;
  replyQueueName: string;
  receiveType?: MessageType;
  timeout?: number;
  responseContains?: ResponseContains;
  waitedReplies?: number;
  handler?: (msg: Record<string, unknown>) => void;
} & ServerRPCOptions;

export type ClientObservable = {
  message: Record<string, unknown>;
};
