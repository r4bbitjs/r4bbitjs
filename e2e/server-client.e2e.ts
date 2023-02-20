import { ConsumeMessage } from 'amqplib';
import { getClient } from '../src/Client/client';
import { getServer } from '../src/Server/server';
import { AckHandler } from '../src/Server/server.type';
import { testReadyObjects } from './test-objects';

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
      { noAck: false }
    );
  }

  let counter = 0;
  setInterval(async () => {
    await client.publishMesage('exchange1', 'something.test2', 'testMessage: ' + counter.toString());
    counter++;
    console.log('sending message: ' + counter);
  }, 1000);

})();

