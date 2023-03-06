import { ConsumeMessage, Message } from 'amqplib';

export type Handler = (msg: ConsumeMessage | null) => void;

export type AckFunction = ((message: Message, allUpTo?: boolean | undefined) => void);

export type AckObj = {
  ack: AckFunction;
  nack: AckFunction;
};

export type AckHandler = (ackObj: AckObj) => Handler;


export type Reply = (replyMessage: any, msg: ConsumeMessage) => Promise<void>;
export type RpcHandler = (reply: Reply) => Handler;