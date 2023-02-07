import { connect, Channel } from 'amqplib';
import { RouteRegister } from '../Server/server.types';

const queueRegisterPerExchange = async (
  exchangeName: string,
  routeRegister: RouteRegister,
  channel: Channel,
  queueName: string,
) => {
  switch (routeRegister.exchangeType) {
  case 'topic':
    await channel.assertQueue(queueName, { durable: true });
    routeRegister.routes.forEach((route) => {
      channel.bindQueue(queueName, exchangeName, route);
    });
    break;
  case 'fanout':
    break;
  case 'direct':
    break;
  case 'headers':
    break;
  }
};

export const initRabbit = async (
  serverRegister: Record<string, RouteRegister>,
  connectionURL: string,
  queueName: string,
) => {
  const connection = await connect(connectionURL);
  const channel = await connection.createChannel();

  for (const exchangeName in serverRegister) {
    const routeRegister = serverRegister[exchangeName];
    const exchangeType = routeRegister.exchangeType;
    const options = routeRegister.options;
    await channel.assertExchange(exchangeName, exchangeType, options);
    await queueRegisterPerExchange(
      exchangeName,
      routeRegister,
      channel,
      queueName,
    );
  }
};
