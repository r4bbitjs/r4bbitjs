import { convertToLoggableType } from './convertToLoggableType';
import { logger } from '../logger';

export const logMqPublishMessage = (message: unknown) => {
  logger.info(
    `🐇 r4bbit is sending the message:`,
    convertToLoggableType(message)
  );
};

export const logMqPublishError = (message: unknown) => {
  logger.error(
    `Error while publishing a message:`,
    convertToLoggableType(message)
  );
};

export const logMqMessageReceived = (message: unknown) => {
  logger.info(`🐇 r4bbit received a message:`, convertToLoggableType(message));
};

export const logMqMessageReceivedError = (message: unknown) => {
  logger.error(
    `Error while receiving a message:`,
    convertToLoggableType(message)
  );
};
