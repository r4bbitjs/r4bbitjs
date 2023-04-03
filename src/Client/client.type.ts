import { MessageType } from '../Common/types';
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
  timeoutRace?: number;
  waitedReplies?: number;
} & ServerRPCOptions;

export type ClientRPCOptionsTest = {
  receiveType?: MessageType;
  timeoutRace?: number;
  waitedReplies?: number;
  expectedNumReplies?: number;
} & ServerRPCOptions;

export type ClientObservable = {
  message: Record<string, unknown>;
};
