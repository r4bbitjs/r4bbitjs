import { convertToLoggableType } from './convertToLoggableType';
import { logger } from '../logger';

type Actor = 'Client' | 'Rpc Client' | 'Server' | 'Rpc Server';

type LogMessageParams = {
  message: unknown;
  actor: Actor;
  topic: string;
  isDataHidden?: boolean;
  isCorrelationIdRevealed?: boolean;
};

const createMsgPrefix = (actor: Actor, topic: string) =>
  `[${actor}] [${topic}]`;

const hideTheData = (message: unknown, isDataHidden?: boolean) =>
  !isDataHidden ? convertToLoggableType(message) : '[🕵️ data-is-hidden]';

export const logMqPublishMessage = ({
  message,
  actor,
  topic,
  isDataHidden,
}: LogMessageParams) => {
  logger.info(
    `🐇 ${createMsgPrefix(actor, topic)} is sending the message:`,
    hideTheData(message, isDataHidden)
  );
};

export const logMqPublishError = ({
  message,
  actor,
  topic,
  isDataHidden,
}: LogMessageParams) => {
  logger.error(
    `${createMsgPrefix(actor, topic)} Error while publishing a message:`,
    hideTheData(message, isDataHidden)
  );
};

export const logMqMessageReceived = ({
  message,
  actor,
  topic,
  isDataHidden,
}: LogMessageParams) => {
  logger.info(
    `🐇 ${createMsgPrefix(actor, topic)} received a message:`,
    hideTheData(message, isDataHidden)
  );
};

export const logMqMessageReceivedError = ({
  message,
  actor,
  topic,
  isDataHidden,
}: LogMessageParams) => {
  logger.error(
    `${createMsgPrefix(actor, topic)} Error while receiving a message:`,
    hideTheData(message, isDataHidden)
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
  logger.info(`🐇 [${actor}] connection closed`);
};
