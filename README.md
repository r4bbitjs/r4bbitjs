![Tests badge](https://github.com/r4bbitjs/r4bbitjs/actions/workflows/e2e.yml/badge.svg)
![Last publish badge](https://github.com/r4bbitjs/r4bbitjs/actions/workflows/publish.yml/badge.svg)

<p align="center" >
  <img src="https://raw.githubusercontent.com/r4bbitjs/r4bbitjs/dev/logo/logo-no-background.png" alt="r4bbit's logo" width="400" />
</p>

# r4bbit

r4bbitjs is the best way to use RabbitMQ in TypeScript. It is a simple abstraction library that allows you to send and receive messages from a RabbitMQ server with ease.

## Why you should use r4bbitjs

- Crazy simple to send and receive messages - it's as easy as sending an HTTP request
- Batteries included (you don't have to think about loggers or request ids)
- It automatically supports all [amqp-connection-manager](https://github.com/jwalton/node-amqp-connection-manager) options because it is built over it, features such as:
  - Automatically reconnect when your amqplib broker dies in a fire.
  - Round-robin connections between multiple brokers in a cluster.
  - If messages are sent while the broker is unavailable, queues messages in memory until we reconnect.

## Documentation and API reference

You can find the documentation and API reference in [r4bbit.io](www.r4bbit.io/).
