import {connect, type Connection, type Channel} from 'amqplib';

type Route = {
	routeName: string,
	exchangeName: string,
	exchangeType: string,
}

type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout';

class Server {
	private _routes: Array<Route> = {};

	get routes() {
		return this.routes;
	}

	registerRoute(routeName: string, exchangeName: keyof Server['_routes'] ) {
		if (exchangeName in this._routes) {
			this._routes[exchangeName].push(routeName);
		}
	}

	createExchange(exchangeName: string, exchangeType: ) {
		this._routes.push()
	}
}

const init = async (server: Server, connectionUrl: string) => {
	const connection: Connection = await connect('amqp://localhost');
	const channel: Channel = await connection.createChannel();
	await channel.assertQueue('register');
	await channel.consume('register', message => {
		const {routeName} = JSON.parse(message.content.toString());
		routeRegister(routeName);
	});
};
