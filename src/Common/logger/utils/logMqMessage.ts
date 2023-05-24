import { convertToLoggableType } from './convertToLoggableType';
import { logger } from '../logger';

type Actor = 'Client' | 'Rpc Client' | 'Server' | 'Rpc Server';

export const logMqPublishMessage = (message: unknown, actor: Actor) => {
  logger.info(
    `🐇 [${actor}] is sending the message:`,
    convertToLoggableType(message)
  );
};

export const logMqPublishError = (message: unknown, actor: Actor) => {
  logger.error(
    `[${actor}] Error while publishing a message:`,
    convertToLoggableType(message)
  );
};

export const logMqMessageReceived = (message: unknown, actor: Actor) => {
  logger.info(
    `🐇 [${actor}] received a message:`,
    convertToLoggableType(message)
  );
};

export const logMqMessageReceivedError = (message: unknown, actor: Actor) => {
  logger.error(
    `[${actor}] Error while receiving a message:`,
    convertToLoggableType(message)
  );
};

export const logMqTimeoutError = (
  message: unknown,
  actor: Actor,
  additionalComment?: string
) => {
  logger.error(
    `⌛️💥 [${actor}] Timeout! ${additionalComment ?? ''}`,
    convertToLoggableType(message)
  );
};

export const logMultipleRepliesReceived = (allReplies: unknown[]) => {
  logger.info(
    `🐇 [Rpc Client] received multiple replies:`,
    JSON.stringify(allReplies)
  );
};

export const logMqClose = (actor: 'Client' | 'Server') => {
  logger.error(`${actor} connection closed`);
};
