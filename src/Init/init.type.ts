import {
  AmqpConnectionManagerOptions,
  CreateChannelOpts,
} from 'amqp-connection-manager';
import { ILogger } from '../Common/logger/logger.type';

export type InitRabbitOptions = {
  connectOptions?: AmqpConnectionManagerOptions;
  createChannelOptions?: CreateChannelOpts;
  logger?: ILogger;
};
