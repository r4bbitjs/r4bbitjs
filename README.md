# Rabbit-Wrapper

# TODO:

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

# Artifacts
- we found out that in our current solution an observable created per publish request and therefore
  we are not able to listen for events coming from other observables. What we want is one observable with multiple
  observer subscription.

  But probably we will use subjects for this job.

  We want to be sure that that we are able to reemit messages with different correlationId than the one in the publisher