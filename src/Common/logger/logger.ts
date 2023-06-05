import pino from 'pino';
import { ILogger } from './logger.type';
import { isString } from '../typeGuards/isString';
import { isObject } from '../typeGuards/isObject';
import { RequestTracer } from '../RequestTracer/requestTracer';

export type LogLevel = 'info' | 'debug' | 'error';

export type ObjectOrString = object | string;

type LogObject = {
  data: unknown;
  level: string;
  requestId?: string;
  actor?: string;
  action?: 'receive' | 'publish';
  topic: string;
};

export type LoggerOptions = {
  isPretty: boolean;
};

export class Logger {
  private options = {
    isPretty: true,
  };

  constructor(private _loggerEngine?: ILogger) {}

  setLogger(value: ILogger, options?: LoggerOptions) {
    this._loggerEngine = value;
    if (options) {
      this.options = options;
    }
  }

  private get logger(): ILogger {
    if (!this._loggerEngine) {
      this._loggerEngine = this.createDefaultLogger();
    }

    return this._loggerEngine;
  }

  private log(level: LogLevel, message: string, meta?: ObjectOrString): void {
    let combinedMessage: string = message;

    if (isString(meta)) {
      combinedMessage = message + ' ' + meta;
    } else if (isObject(meta)) {
      combinedMessage = message + ' ' + JSON.stringify(meta, null, 2);
    }

    const logObject: LogObject = {
      message,
      level,
    };

    const instance = RequestTracer.getInstance();
    if (instance.getRequestId) {
      logObject.requestId = instance.getRequestId();
    }

    this.logger[level](JSON.stringify(logObject, null, 2));
  }

  public info(message: string, meta?: ObjectOrString): void {
    this.log('info', message, meta);
  }

  public debug(message: string, meta?: ObjectOrString): void {
    this.log('debug', message, meta);
  }

  public error(message: string, meta?: ObjectOrString): void {
    const errorPrefix = '❌ r4bbit error: ';
    this.log('error', errorPrefix + message, meta);
  }

  
  /**
   * logObject: {
   *  actor: 'Client' , 'Server', 'Rpc Client', 'Rpc Server' 
   *  action: 'receive' | 'publish
   *  data: Object 
   *  requestId: string
   *  topic: string
   * }
   */
  public communicationLog(logObject: ) {
    const instance = RequestTracer.getInstance();
    if (instance.getRequestId) {
      logObject.requestId = instance.getRequestId();
    }
    const message = JSON.stringify(
      logObject,
      null,
      this.options.isPretty ? 2 : 0
    );
    this.logger['info'](message);
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

export const setLogger = (
  clientLogger: ILogger,
  loggerOptions?: LoggerOptions
) => {
  logger.setLogger(clientLogger, loggerOptions);
};
