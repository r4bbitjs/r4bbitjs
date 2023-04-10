# Rabbit-Wrapper

# TODO:

- Add a method for clients to receive the channelWrapper for whatever customization
- preparing header options doesn't work for the server RPC register so make it work
- we're working on e2e tests of RPC flow
- Generics to the RPC call
- Write auto ack for client consume
- reply exchange different then default and as an option accepting exchange
- create a util with Promise with a timeout
- maybe use a timeout option in amqp wrapper lib
- sonar-cloud
- decorators after RPC functionality
- exchange and queue asserttion utility function
- GitHub packages for versioning
- examples section
- GitHub Pages


# Multiple Replies:
1. [DONE] reply = -1, timeout >= 0 Client has to wait until promise resolves 
2. [DONE] reply = -1, timeout >= 0 Response is processed by the client handler function
3. [DONE] reply = 3, timeout 10 a counter variable counts until all the replies receive and resolves
4. Make the response spread if only content is specified
5. Allow from user a whitelist of possible serers also instead of waitedReplies
6. give headers to the client with the decoded message


