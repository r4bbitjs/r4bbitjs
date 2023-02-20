import { getServer } from '../src/Server/server';
import { getClient } from '../src/Client/client';
import { testReadyObjects } from './manual-test';
import { AckHandler } from '../src/Server/server.type';
import { ConsumeMessage } from 'amqplib';
import { AckObj } from '../src/Server/server.type';

const handlerFunc: AckHandler =
  ({ ack }) =>
    (msg: ConsumeMessage | null) => {
      if (!msg) return;
      if (!ack) return;

      console.log(msg.content.toString());

      
      try {
        ack(msg);
      } catch (error) {
        console.log('error', error);
      }
    };

const basicHandler = (msg: ConsumeMessage | null) => {
  if (!msg) return;

  console.log(msg.content.toString());

};


(async () => {
  const server = await getServer('amqp://localhost');
  const client = await getClient('amqp://localhost');

  for (const obj of testReadyObjects) {
    await server.registerRoute(
      obj.queueName,
      obj.key,
      obj.exchangeName,
      handlerFunc,
      { noAck: false}
    );
  }

  let counter = 0;
  setInterval(async () => {
    await client.publishMesage('exchange1', 'something.test2', 'testMessage: ' + counter.toString());
    counter++;
    console.log('sending message: ' + counter);
  }, 1000);

})();

