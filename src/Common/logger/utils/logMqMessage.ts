import { logger } from '../logger';

export const logMqClose = (actor: 'Client' | 'Server') => {
  logger.info(`🐇 [${actor}] connection closed`);
};
