import { MessageType } from '../Common/types';
import { ResponseContains } from '../Common/types';
import { ServerRPCOptions } from '../Server/server.type';

export type ClientConnection = {
  exchangeName: string;
  routingKey: string;
};

export type ClientConnectionRPC = {
  exchangeName: string;
  routingKey: string;
  replyQueueName: string;
};

export type ClientRPCOptions = {
  receiveType?: MessageType;
  timeout?: number;
  responseContains?: ResponseContains;
} & ServerRPCOptions;

export type ClientRPCOptionsMultiple = {
  receiveType?: MessageType;
  timeout?: number;
  responseContains?: ResponseContains;
  waitedReplies: number;
} & ServerRPCOptions;

export type ClientRPCOptionsUnknownReplies = {
  receiveType?: MessageType;
  timeout?: number;
  responseContains?: ResponseContains;
  handler: (msg: Record<string, unknown>) => void;
} & ServerRPCOptions;

export type ClientObservable = {
  message: Record<string, unknown>;
};
