import pino from 'pino';
import { ILogger } from './logger.type';
import { isString } from '../typeGuards/isString';
import { isObject } from '../typeGuards/isObject';

export type LogLevel = 'info' | 'debug' | 'error';

export type ObjectOrString = object | string;

export class Logger {
  constructor(private _loggerEngine?: ILogger) {}

  setLogger(value: ILogger) {
    this._loggerEngine = value;
  }

  private get logger(): ILogger {
    if (!this._loggerEngine) {
      this._loggerEngine = this.createDefaultLogger();
    }

    return this._loggerEngine;
  }

  public log(level: LogLevel, message: string, meta?: ObjectOrString): void {
    let combinedMessage: string = message;

    if (isString(meta)) {
      combinedMessage = message + ' ' + meta;
    } else if (isObject(meta)) {
      combinedMessage = message + ' ' + JSON.stringify(meta);
    }

    this.logger[level](combinedMessage);
  }

  public info(message: string, meta?: ObjectOrString): void {
    this.log('info', message, meta);
  }

  public debug(message: string, meta?: ObjectOrString): void {
    this.log('debug', message, meta);
  }

  public error(message: string, meta?: ObjectOrString): void {
    this.log('error', message, meta);
  }

  private createDefaultLogger(): ILogger {
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

export const logger = new Logger();
