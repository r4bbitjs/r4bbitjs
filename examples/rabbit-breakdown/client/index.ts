import express from 'express';
import { getClient } from '../../../src';

const app = express();

const rabbitClient = () => {
  return getClient(['amqp://guest:guest@localhost:5672/'], {
    createChannelOptions: {
      name: 'fibonacci',
      publishTimeout: 9999999,
    },
  });
};

app.get('/', async (_req: express.Request, res: express.Response) => {
  const client = await rabbitClient();
  const reply = await client.publishRPCMessage(
    {
      n: 5,
    },
    {
      exchangeName: 'r4bbit-express',
      routingKey: 'fibonacci.topic',
      replyQueueName: 'fibonacci',
      receiveType: 'json',
    }
  );

  res.json(reply);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Client started on port ${PORT}`);
});
