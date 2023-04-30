# Rabbit-Wrapper

# TODO:
- Add loger in order to warn onClose and retry connection after some interval
- When rabbitmq does not exist warn the client
- Gracefully close the connection
- sonar-cloud
- GitHub packages for versioning 
    -- automatic semantic versioning
- Documentation
    - example
- GitHub Pages
- Add timeout on establishing connection with rabbit 
    (eg. should throw an arror when there is no active RabbitMQ service)
- Create a workflow that installs rabbitmq and write e2e tests that actually test the behaviour


# Multiple Replies:
1. [v2] Make the response spread if only content is specified
2. [v2] Allow from user a whitelist of possible servers also instead of waitedReplies


