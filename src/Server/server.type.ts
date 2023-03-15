import { ConsumeMessage, Message } from 'amqplib';

export type Handler = (msg: ConsumeMessage | null) => void;

export type AckFunction = ((message: Message, allUpTo?: boolean | undefined) => void);

export type AckObj = {
  ack: AckFunction;
  nack: AckFunction;
};

export type AckHandler = (ackObj: AckObj) => Handler;

// A function used in RPC process that let user send a response of an RPC method to a queue
// for implementation check registerRPCRoute in server.ts
export type Reply = (replyMessage: any, msg: ConsumeMessage) => Promise<void>;
export type RpcHandler = (reply: Reply) => Handler;

export type ServerConnection = {
  queueName: string;
  routingKey: string;
  exchangeName: string;
}