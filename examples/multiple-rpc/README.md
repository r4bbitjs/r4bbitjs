# Multiple RPC example

This example displays how to send an RPC message that is received and replied by one or many rpc servers.

It has a timeout option and if the timeout occurs before receiving all the expected answer client just serves all the replies recieved.

### To run it:
   - Open terminal and go to the example repository
   - `pnpm i` or `npm i` to install dependencies
   - `pnpm start` or `npm run start` to start an example

### RabbitMq tutorial for multiple RPC

R4bbitmq by default do not support receiving multiple answers servers, r4bbitjs adds this functionality on top of basic RabbitMq features.