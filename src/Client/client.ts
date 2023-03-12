import { Channel, ChannelWrapper, ConnectionUrl, Options } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import {EventEmitter} from 'events'
import { Observable } from 'rxjs';

import { initRabbit } from '../Init/init';
import { InitRabbitOptions } from '../Init/init.type';

const REPLY_QUEUE = 'amq.rabbitmq.reply-to';


export class Client {
  private channelWrapper?: ChannelWrapper;
  private eventEmitter = new EventEmitter();

  public init = async (
    connectionUrls: ConnectionUrl[] | ConnectionUrl,
    options?: InitRabbitOptions,
  ): Promise<void> => {
    this.channelWrapper = await initRabbit(connectionUrls, options);
  };

  public async publishMessage(
    exchangeName: string,
    routingKey: string,
    message: Buffer | string | unknown,
    options?: Options.Publish,
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const defaultOptions = options ?? { persistent: true };

    await this.channelWrapper.publish(exchangeName, routingKey, message, defaultOptions);
  }

  public async publishRPCMessage(
    exchangeName: string,
    message: Buffer | string | unknown,
    routingKey: string,
    replyQueueName: string,
    options?: Options.Publish,
  ) {
    if (!this.channelWrapper) {
      throw new Error('You have to trigger init method first');
    }

    const defaultOptions = options ?? { persistent: true };
    // consumer for RPC messages' responses

    const prefixedReplyQueueName = `reply.${replyQueueName}`
    
    const clientConsumeFunction = (msg: ConsumeMessage | null) => {
      this.eventEmitter.emit(msg?.properties.correlationId, msg);
    }
    
    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertQueue(prefixedReplyQueueName);
      await channel.consume(prefixedReplyQueueName, clientConsumeFunction, options);
    });


    // create a promise that resolves when an event is cautch 
    // TODO: create a util with Promise with a timeout 
    // TODO: maybe use a timeout option in amqp wrapper lib
    return new Promise(async (resolve, reject) => {
      const corelationId = uuidv4();
      this.eventEmitter.once(String(corelationId), (msg) => {
        resolve(msg);
      });
      if (!this.channelWrapper) {
        throw new Error('You have to trigger init method first');
      }

      setTimeout(() => {
        reject('timeout');
      }, 30_000);
      await this.channelWrapper.publish(exchangeName, routingKey, message, {
        ...defaultOptions,
        replyTo: prefixedReplyQueueName,
        correlationId: corelationId
      });
    });
  }
}

let client: Client;
export const getClient = async (
  connectionUrls: ConnectionUrl | ConnectionUrl[],
  options?: InitRabbitOptions,
) => {
  if (!client) {
    client = new Client();
    await client.init(connectionUrls, options);
  }

  return client;
};
