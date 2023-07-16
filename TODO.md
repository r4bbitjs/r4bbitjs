# TODO:
- Add a connection close function so that users can actually close the connection
- Add logger in order to warn onClose and retry connection after some interval
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


# V2:
- Create a config (based eg. on environmental variables) that would:
   * allow user to anonimize logs' contents
   * allow message wise and global wise anonymization
   * option to enable / disable requestId in logs
   * Allow maps and sets in logging using superjson

- Multiple Replies:
1. [v2] Make the response spread if only content is specified
2. [v2] Allow from user a whitelist of possible servers also instead of waitedReplies


Roadmap:

  1- Finish logging
  2- Create an alpha package with ci/cd pipeline
  3 - examples and documentation
