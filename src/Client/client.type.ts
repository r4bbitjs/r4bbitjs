import { MessageType } from '../Common/types';
import { Options } from 'amqp-connection-manager';

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
  sendType?: MessageType;
  receiveType?: MessageType;
  publishOptions?: Options.Publish;
};


