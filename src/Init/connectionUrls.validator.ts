import { ConnectionUrl, Options } from 'amqp-connection-manager';
import { rabbitUriSchema } from './schema/url.schema';
import { logger } from '../Common/logger/logger';

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isContainsUrl = (value: object): value is { url: string } => {
  return 'url' in value;
};

const isOptionsConnection = (value: object): value is Options.Connect => {
  const isItTrue =
    'vhost' in value &&
    'hostname' in value &&
    'port' in value &&
    'username' in value &&
    'password' in value;
  return isItTrue;
};

const connectionObjectToUrl = (connection: Options.Connect) => {
  const { vhost, hostname, port, username, password } = connection;

  const protocol = connection.protocol ? 's' : '';
  const frameMax = connection.frameMax
    ? `?frameMax=${connection.frameMax}`
    : '';
  const heartbeat = connection.heartbeat
    ? `&heartbeat=${connection.heartbeat}`
    : '';
  const locale = connection.locale ? `&locale=${connection.locale}` : '';

  return `amqp${protocol}://${username}:${password}@${hostname}:${port}/${vhost}${frameMax}${heartbeat}${locale}`;
};

const getUrl = (connectionUrl: ConnectionUrl) => {
  if (isString(connectionUrl)) {
    return connectionUrl;
  }

  if (isContainsUrl(connectionUrl)) {
    return connectionUrl.url;
  }

  if (isOptionsConnection(connectionUrl)) {
    return connectionObjectToUrl(connectionUrl);
  }

  throw new Error(
    'connectionUrls are not of type ConnectionUrl | ConnectionUrl[]'
  );
};

const getUrlFlatList = (connectionUrls: ConnectionUrl[] | ConnectionUrl) => {
  return Array.isArray(connectionUrls)
    ? connectionUrls.map((url) => getUrl(url))
    : [getUrl(connectionUrls)];
};

export const validateUri = async (
  connectionUrls: ConnectionUrl[] | ConnectionUrl
) => {
  const invalidUrls = [];

  for await (const url of getUrlFlatList(connectionUrls)) {
    try {
      await rabbitUriSchema.parseAsync(url);
    } catch {
      invalidUrls.push(url);
    }
  }

  if (invalidUrls.length > 0) {
    const errorMsg =
      'One or more RabbitMQ URIs are not valid -> ' + invalidUrls.join(', ');

    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};
