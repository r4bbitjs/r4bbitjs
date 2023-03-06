import { ConnectionUrl } from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';
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

const localUrl = 'amqp://guest:guest@localhost:5672/';
const objectUrl = {
  url: 'amqp://guest:guest@localhost:5672/v1',
}
const objectUrl2: Options.Connect = {
  username: 'guest',
  password: 'guest',
  hostname: 'localhost',
  port: 5672,
  vhost: 'v2',
  locale: 'en_US',
  frameMax: 0x1000,
  heartbeat: 0,
}


const checkMessagesDispatch = async (url: ConnectionUrl | ConnectionUrl[]) => {
  const server = await getServer(url);
  const client = await getClient(url);

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
    await client.publishMessage('exchange1', 'something.test2', 'testMessage: ' + counter.toString());
    counter++;
    console.log('sending message: ' + counter);
  }, 1000);
}

(async () => {
  const connectionObjects = ['amqp://localhost', localUrl, objectUrl, objectUrl2];

  // for (const connectionObject of connectionObjects) {
  //   await checkMessagesDispatch(connectionObject);
  // }

  await checkMessagesDispatch(['amqp://localhost', localUrl, objectUrl]);
})();

