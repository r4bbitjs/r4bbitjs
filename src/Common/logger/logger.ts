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
import { RequestTracer } from '../RequestTracer/requestTracer';
import { convertToLoggableType } from './utils/convertToLoggableType';
import { colorizedStringify } from './utils/colorizedStringify/colorizedStringify';
import chalk from 'chalk';
import {
  colorMap,
  monokaiColorTheme,
} from './utils/colorizedStringify/colorMap';
import { fetchReqId } from '../prepareHeaders/prepareHeaders';

const hideTheData = (message: unknown, isDataHidden?: boolean) =>
  !isDataHidden ? convertToLoggableType(message) : '[🕵️ data-is-hidden]';

type IColorMap = (isColor: boolean) => Record<string, string>;

export class Logger {
  private options: LoggerOptions = {
    isColor: true,
    isJson: true,
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
    logObject.requestId = logObject.requestId ?? fetchReqId();
    logObject.data = hideTheData(logObject.data, logObject.isDataHidden);

    const preparedLog = this.options.isJson
      ? JSON.stringify(logObject)
      : this.prettifyLog(logObject);

    this.logger[logObject.level ?? 'info'](preparedLog);
  }

  empty = (str: string) => str;

  colorTable: Record<string, chalk.Chalk> = this.options.isColor
    ? {
        actor: chalk.hex(monokaiColorTheme.Green),
        action: chalk.hex(monokaiColorTheme.Green),
        topic: chalk.hex(monokaiColorTheme.Green),
        requestId: chalk.hex(monokaiColorTheme.Green),
        data: chalk.hex(monokaiColorTheme.Green),
        level: chalk.hex(monokaiColorTheme.Green),
        error: chalk.hex(monokaiColorTheme.Green),
      }
    : {
        actor: this.empty as chalk.Chalk,
        action: this.empty as chalk.Chalk,
        topic: this.empty as chalk.Chalk,
        requestId: this.empty as chalk.Chalk,
        data: this.empty as chalk.Chalk,
        level: this.empty as chalk.Chalk,
        error: this.empty as chalk.Chalk,
      };

  prettifyLog = (communicationLog: CommunicationLog): string => {
    delete communicationLog.isDataHidden;

    const { colorizeKey } = colorMap(this.options.isColor);

    return `\n${Object.entries(communicationLog)
      .map(([key, value]) => {
        const colorizeMethod = this.colorTable[key as CommunicationLogKeys];
        const colorMap: Record<string, string> = {
          signature: monokaiColorTheme.Green,
          headers: monokaiColorTheme.Yellow,
          content: monokaiColorTheme.Orange,
        };

        if (key === 'data') {
          return `${colorizeKey(key)}: ${colorizedStringify(
            value,
            colorMap,
            1,
            this.options.isColor
          )}`;
        }

        if (key === 'error') {
          return `${colorizeKey(key)}: ${
            (colorizedStringify(value, {}, 1), this.options.isColor)
          }`;
        }

        return `${colorizeKey(key)}: ${colorizeMethod(value)}`;
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
