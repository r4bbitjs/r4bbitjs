import pino from 'pino';
import {
  CommunicationLog,
  CommunicationLogKeys,
  GenericLog,
  ILogger,
  LogLevel,
  LoggerOptions,
  ObjectOrString,
} from './logger.type';
import { RequestTracer } from '../requestTracer/requestTracer';
import { convertToLoggableType } from './utils/convertToLoggableType';
import { colorizedStringify } from './utils/colorizedStringify/colorizedStringify';
import colors from 'colors';
import { Colors } from './colors.type';
colors.enable();

const hideTheData = (message: unknown, isDataHidden?: boolean) =>
  !isDataHidden ? convertToLoggableType(message) : '[🕵️ data-is-hidden]';

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

  private addReqIdToLog(logObject: GenericLog) {
    const instance = RequestTracer.getInstance();
    if (instance.getRequestId) {
      return {
        ...logObject,
        requestId: instance.getRequestId(),
      };
    }

    return logObject;
  }

  private log(level: LogLevel, logObject: GenericLog): void {
    const finalLogObject = this.addReqIdToLog(logObject);
    this.logger[level](JSON.stringify(finalLogObject, null, 2));
  }

  public info(message: string, meta?: ObjectOrString): void {
    this.log('info', { message, meta });
  }

  public debug(message: string, meta?: ObjectOrString): void {
    this.log('debug', { message, meta });
  }

  public error(message: string, meta?: ObjectOrString): void {
    const errorPrefix = '❌ r4bbit error: ';
    this.log('error', { message: `${errorPrefix} ${message}`, meta });
  }

  public communicationLog(logObject: CommunicationLog) {
    const instance = RequestTracer.getInstance();
    if (instance.getRequestId) {
      logObject.requestId = instance.getRequestId();
    }
    logObject.data = hideTheData(logObject.data, logObject.isDataHidden);

    const coloredLog = this.prepareLog(logObject);
    this.logger[logObject.level ?? 'info'](coloredLog);
  }

  colorTable: Record<string, Colors> = {
    actor: 'america',
    action: 'blue',
    topic: 'magenta',
    requestId: 'yellow',
    data: 'cyan',
    level: 'white',
    error: 'red',
  };

  private prepareLog(communicationLog: CommunicationLog): string {
    delete communicationLog.isDataHidden;

    return (
      Object.entries(communicationLog)
        .map(([key, value]) => {
          const keyColored = key.gray;
          const propertyColor = this.colorTable[key as CommunicationLogKeys];
          const colorMap: Record<string, Colors> = {
            signature: 'red',
            headers: 'blue',
            content: 'bgCyan',
          };

          if (key === 'data') {
            return colorizedStringify({ data: value }, colorMap);
          }

          if (key === 'error') {
            return colorizedStringify({ error: value }, colorMap);
          }

          return `${keyColored}: ${
            String(value)[propertyColor as unknown as number]
          }`;
        })
        .join('\n') + '\n'
    );
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
