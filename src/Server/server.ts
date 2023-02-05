import {connect, type Connection, type Channel} from 'amqplib';
import {RouteRegister, ExchangeType} from './server.types';


class Server {
	private _routes: Record<string, RouteRegister> = {};

	get routes() {
		return this.routes;
	}

	registerRoute(routeName: string, exchangeName: keyof Server['_routes'] ) {
		if (exchangeName in this._routes) {
			this._routes[exchangeName].routes.push(routeName);
		}
	}

	createExchange(exchangeName: string, exchangeType: ExchangeType) {
		this._routes[exchangeName] = { routes: [], exchangeType };
	}
}

