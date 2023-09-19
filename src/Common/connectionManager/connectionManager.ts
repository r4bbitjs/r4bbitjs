import {
  type AmqpConnectionManager,
  type ChannelWrapper,
} from 'amqp-connection-manager';
import { InitRabbitOptions } from '../../Init/init.type';
import { logger } from '../logger/logger';

export class ConnectionManager {
  private static _options: InitRabbitOptions | undefined;
  private static _channelWrapper: ChannelWrapper;

  static setOptions(options: InitRabbitOptions | undefined) {
    this._options = options;
  }

  static async recreate(
    connection: AmqpConnectionManager
  ): Promise<ChannelWrapper> {
    if (!this.options) {
      logger.debug(
        'No options has been passed while creating a channelWrapper'
      );
    }

    this._channelWrapper = connection.createChannel(
      this.options?.createChannelOptions
    );

    await this._channelWrapper.waitForConnect();

    return this.channelWrapper;
  }

  static get options(): InitRabbitOptions | undefined {
    return this._options;
  }

  static get channelWrapper(): ChannelWrapper {
    return this._channelWrapper;
  }
}
