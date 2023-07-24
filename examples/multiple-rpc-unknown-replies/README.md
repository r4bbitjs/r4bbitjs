# Multiple RPC Unknown Replies example

This example displays how to send an RPC message that is received and replied by one or many rpc servers.
This example seperates itself from "multiple rpc" by accepting any number of answers as reply.

Client takes a handler function and based on the server signature of the replies received, it takes different actions.

When timeout occurs, client stops listening for new replies coming from servers.

### To run it:
   - Open terminal and go to the example repository
   - `pnpm i` or `npm i` to install dependencies
   - `pnpm start` or `npm run start` to start an example

### RabbitMq tutorial for multiple RPC

R4bbitmq by default do not support receiving multiple unknown replies from servers, r4bbitjs adds this functionality on top of basic RabbitMq features.