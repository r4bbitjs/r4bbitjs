export type RouteRegister = {
	routes: Array<string>,
	exchangeType: string,
}

export type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout';