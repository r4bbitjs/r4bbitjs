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

export const testReadyObjects = flatTheObjects(testObject);
