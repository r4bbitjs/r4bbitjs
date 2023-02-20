import { AmqpConnectionManagerOptions, CreateChannelOpts } from 'amqp-connection-manager';

export type InitRabbitOptions = {
    connectOptions?: AmqpConnectionManagerOptions;
    createChannelOptions?: CreateChannelOpts;
}
