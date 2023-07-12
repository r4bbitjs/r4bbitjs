import { ChannelWrapper } from 'amqp-connection-manager';
import { logger } from '../logger/logger';

export class ConnectionSet {
  private static connectionSet = new Set<string>();

  private static serialize = (exchange: string, queue = '', routingKey = '') =>
    `${exchange}-*-${queue}-*-${routingKey}`;

  private static isCacheHit = (
    exchange: string,
    queue = '',
    routingKey = ''
  ): boolean => {
    const key = this.serialize(exchange, queue, routingKey);

    return ConnectionSet.connectionSet.has(key);
  };

  private static setCache = (
    exchange: string,
    queue = '',
    routingKey = ''
  ): void => {
    const key = this.serialize(exchange, queue, routingKey);

    ConnectionSet.connectionSet.add(key);
  };

  /**
   * Does all the necessary assertions and bindings
   *
   * @param exchange - will assert exchange if not cached
   * @param queue - will assert queue and bind it to exchange if provided
   * @param routingKey - will bind queue to exchange with routingKey if provided
   * @param channelWrapper
   * @returns void
   */
  public static assert = async (
    channelWrapper: ChannelWrapper,
    exchange: string,
    queue = '',
    routingKey = ''
  ): Promise<void> => {
    if (this.isCacheHit(exchange, queue, routingKey)) {
      return;
    }

    try {
      await channelWrapper.assertExchange(exchange, 'topic');

      if (queue) {
        await channelWrapper.assertQueue(queue);
        await channelWrapper.bindQueue(queue, exchange, routingKey);
      }
    } catch (err: unknown) {
      logger.error('Assertion error, exchange queue or binding threw an error');
    }

    this.setCache(exchange, queue, routingKey);
  };
}
