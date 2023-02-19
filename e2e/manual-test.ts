import { initRabbit, publishMessage, registerRoute } from '../src/Init/init';

type TestObject = {
  exchangeName: string;
  queues: {
    queueName: string;
    keys: string[];
  }[]
}

const testObject = [{
  exchangeName: 'exchange1',
  queues: [
    {
      queueName: 'queue1',
      keys: ['test1.*', '*.test2']
    },
    {
      queueName: 'queue2',
      keys: ['test3.*', '*.test2']
    },
  ]
},
{
  exchangeName: 'exchange2',
  queues: [
    {
      queueName: 'queue1',
      keys: ['test1.*', '*.test4']
    },
    {
      queueName: 'queue3',
      keys: ['test1.*', '*.test5'],
    },

  ]
},
];

type FlatObjects = {
  exchangeName: string;
  queueName: string;
  key: string;
}



const flatTheObjects = (testObject: TestObject[]): FlatObjects[] => {
  const flattenedObjects: FlatObjects[] = [];
  for (const test of testObject) {
    for (const queue of test.queues) {
      for (const key of queue.keys) {
        flattenedObjects.push({
          exchangeName: test.exchangeName,
          queueName: queue.queueName,
          key
        });
      }
    }
  }

  return flattenedObjects;
};


const test = async () => {
  const channelWrapper = await initRabbit(['amqp://localhost']);
  const routeRegister = registerRoute(channelWrapper);

  const flattenedObjects = flatTheObjects(testObject);

  for (const obj of flattenedObjects) {
    await routeRegister(obj.queueName, obj.key, obj.exchangeName);
  }

};
let counter = 0;
const testSendMessage = async () => {
  const channelWrapper = await initRabbit(['amqp://localhost']);
  const client = publishMessage(channelWrapper);
  setInterval(async () => {
    await client('exchange1', 'something.test2', 'testMessage: ' + counter);
    counter++;
  }, 1000);

  console.log('end of test');
};

(async () => {
  await test();
  await testSendMessage();
})();
