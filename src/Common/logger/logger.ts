import pino from 'pino';
import {
  CommunicationLog,
  GenericLog,
  ILogger,
  LogLevel,
  LoggerOptions,
  ObjectOrString,
} from './logger.type';
import { RequestTracer } from '../RequestTracer/requestTracer';
import { convertToLoggableType } from './utils/convertToLoggableType';
import { colorizedStringify } from './utils/colorizedStringify/colorizedStringify';
import { ColorTheme, monokaiColors } from './utils/colorizedStringify/colorMap';
import { fetchReqId } from '../prepareHeaders/prepareHeaders';
import { ColorizeFn } from './utils/colorizedStringify/colorMap.type';

const hideTheData = (message: unknown, isDataHidden?: boolean) =>
  !isDataHidden ? convertToLoggableType(message) : '[🕵️ data-is-hidden]';

export class Logger {
  private options: LoggerOptions = {
    isColor: true,
    isJson: false,
  };

  constructor(private _loggerEngine?: ILogger) {}

  setLogger(value: ILogger, options?: LoggerOptions) {
    this._loggerEngine = value;
    if (options) {
      this.options = options;
    }

    if (options?.colors) {
      ColorTheme.colors = options.colors;
    }

    if (options?.isColor === false) {
      ColorTheme.isColor = options.isColor;
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
    logObject.requestId = logObject.requestId ?? fetchReqId();
    logObject.data = hideTheData(logObject.data, logObject.isDataHidden);

    const preparedLog = this.options.isJson
      ? JSON.stringify(logObject)
      : this.prettifyLog(logObject);

    this.logger[logObject.level ?? 'info'](preparedLog);
  }

  empty = (str: string) => str;

  colorTable: Record<string, ColorizeFn> = {
    actor: ColorTheme.colorize(),
    action: ColorTheme.colorize(),
    topic: ColorTheme.colorize(),
    requestId: ColorTheme.colorize(),
    data: ColorTheme.colorize(),
    level: ColorTheme.colorize(),
    error: ColorTheme.colorize(),
  };

  prettifyLog = (communicationLog: CommunicationLog): string => {
    delete communicationLog.isDataHidden;

    return `\n${Object.entries(communicationLog)
      .map(([key, value]) => {
        const colorMap: Record<string, string> = {
          signature: monokaiColors.Red,
          headers: monokaiColors.Yellow,
          content: monokaiColors.Orange,
        };

        if (key === 'data') {
          return `${ColorTheme.colorize('key')(key)}: ${colorizedStringify(
            value,
            colorMap,
            1
          )}`;
        }

        if (key === 'error') {
          return `${ColorTheme.colorize('key')(key)}: ${colorizedStringify(
            value,
            {},
            1
          )}`;
        }

        return `${ColorTheme.colorize('key')(key)}: ${ColorTheme.colorize()(
          value as string
        )}`;
      })
      .join('\n')}\n`;
  };

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
