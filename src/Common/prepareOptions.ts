import { HEADER_SEND_TYPE, HEADER_RECEIVE_TYPE, } from './types';
import { ClientRPCOptions } from '../Client/client.type'
import { ServerRPCOptions } from '../Server/server.type';
import { Options } from 'amqplib';

export const preparePublishOptions = (options?: ClientRPCOptions ): Options.Publish => {
    const defaultOptions = { persistent: true };
    const defaultMsgType = 'json';

    return {
        ...defaultOptions,
        ...options?.publishOptions,
        headers: {
            [HEADER_SEND_TYPE]: options?.sendType ?? defaultMsgType,
            [HEADER_RECEIVE_TYPE]: options?.receiveType ?? defaultMsgType,
        },
    };
}

export const prepareConsumeOptions = (options?: ServerRPCOptions ): Options.Publish => {
    const defaultOptions = { persistent: true };
    const defaultMsgType = 'json';

    return {
        ...defaultOptions,
        ...options?.publishOptions,
        headers: {
            [HEADER_SEND_TYPE]: options?.sendType ?? defaultMsgType,
        },
    };
}