import { Options } from "amqplib";
import { RouteRegister, ExchangeType } from "./server.types";

export class Server {
  private _routes: Record<string, RouteRegister> = {};

  get routes(): Record<string, RouteRegister> {
    return this.routes;
  }

  registerRoute(routeName: string, exchangeName: keyof Server["_routes"]) {
    if (exchangeName in this._routes) {
      this._routes[exchangeName].routes.push(routeName);
    }
  }

  createExchange(
    exchangeName: string,
    exchangeType: ExchangeType,
    options?: Options.AssertExchange,
  ) {
    if (!options) {
      // default options
      options = { durable: true };
    }

    this._routes[exchangeName] = { routes: [], exchangeType, options };
  }
}
