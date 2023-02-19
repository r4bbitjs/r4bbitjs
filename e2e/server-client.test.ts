import { getServer } from '../src/Server/server';
import { getClient } from '../src/Client/client';
import { testReadyObjects } from './manual-test';
import { AckHandler, AckObj } from '../src/Server/server.type';
import { ConsumeMessage } from 'amqplib';

const handlerFunc: AckHandler =
  ({ ack }) =>
    (msg: ConsumeMessage | null) => {
      if (!msg) return;
      
      console.log(msg.content.toString());
      ack(msg);
    };

const server = await getServer('amqp://localhost');
const client = await getClient('amqp://localhost');

for (const obj of flattenedObjects) {
  await server.registerRoute(
    obj.queueName,
    obj.key,
    obj.exchangeName,
    handlerFunc,
  );
}
