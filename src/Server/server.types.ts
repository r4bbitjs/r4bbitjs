import { Options } from 'amqplib';

export type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout';

export type RouteRegister = {
	routes: Array<string>,
	exchangeType: ExchangeType,
    options?: Options.AssertExchange
}
