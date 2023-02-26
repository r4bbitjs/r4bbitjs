import { z } from 'zod';

const completeRabbitUriSchema = z.string().regex(/amqps?:\/\/.+:.+@.+:\d+\/.+/);

const localUriSchema = z.string().regex(/amqp:\/\/localhost/);

export const rabbitUriSchema = z.union([
    completeRabbitUriSchema,
    localUriSchema,
]);
