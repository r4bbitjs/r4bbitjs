import { Options } from 'amqp-connection-manager';
import { MessageType } from '../Common/types';

export type Handler = (msg: string | Record<string, unknown>) => void;

export type ServerRPCHandler = (msg: string | Record<string, unknown>) => void;

export type AckFunction = () => void;

export type AckObj = {
  ack: AckFunction;
  nack: AckFunction;
};

export type AckHandler = (ackObj: AckObj) => Handler;

// A function used in RPC process that let user send a response of an RPC method to a queue
// for implementation check registerRPCRoute in server.ts
export type Reply = (
  replyMessage: Record<string, unknown> | string
) => Promise<void>;
export type RpcHandler = (reply: Reply) => ServerRPCHandler;

export type ServerConnection = {
  queueName: string;
  routingKey: string;
  exchangeName: string;
};

export type ServerRPCOptions = {
  publishOptions?: Options.Publish;
  consumeOptions?: Options.Consume;
  sendType?: MessageType;
  correlationId?: string;
  replySignature?: string;
};
