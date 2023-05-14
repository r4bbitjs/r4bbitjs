import pino from 'pino';
import { ILogger } from './logger.type';

export class Logger {
  private static _logger: ILogger;

  static set logger(value: ILogger) {
    this._logger = value;
  }

  static get logger(): ILogger {
    if (!this._logger) {
      this.logger = this.createDefaultLogger();
    }

    return this._logger;
  }

  public static info(message: unknown): void {
    this.logger.info(message);
  }

  public static debug(message: unknown): void {
    this.logger.debug(message);
  }

  public static error(message: unknown): void {
    this.logger.error(message);
  }

  private static createDefaultLogger(): ILogger {
    return pino({
      transport: {
        target: 'pino-pretty',
      },
      options: {
        colorize: true,
      },
      level: 'debug',
    });
  }
}

export const logger = Logger.logger;
