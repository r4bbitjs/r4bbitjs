import { logger } from '../logger';

export const logMultipleRepliesReceived = (allReplies: unknown[]) => {
  logger.info(
    `🐇 [Rpc Client] received multiple replies:`,
    JSON.stringify(allReplies)
  );
};

export const logMqClose = (actor: 'Client' | 'Server') => {
  logger.info(`🐇 [${actor}] connection closed`);
};
