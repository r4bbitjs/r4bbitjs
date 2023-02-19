import { ConsumeMessage, Message } from 'amqplib';

export type Handler = (msg: ConsumeMessage | null) => void;

type AckFunction = ((message: Message, allUpTo?: boolean | undefined) => void) | undefined;
type AckObj = {
    ack: AckFunction;
    nack: AckFunction;
}
export type AckHandler = (ackObj: AckObj) => Handler;

export type RegisterRouteOptions = {
    noAck: boolean
}