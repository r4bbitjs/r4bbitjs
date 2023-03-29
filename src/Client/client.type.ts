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
} & ServerRPCOptions;
