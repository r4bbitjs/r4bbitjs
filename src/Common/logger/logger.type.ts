import { Colors } from './utils/colorizedStringify/colorMap.type';

export type ILogger = {
  info: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
};

export type LogLevel = 'info' | 'debug' | 'error';

export type ObjectOrString = object | string;

export type LoggerOptions = {
  isColor?: boolean;
  isJson?: boolean;
  colors?: Colors;
};

export type LogObject = {
  data: unknown;
  level: string;
  requestId?: string;
  actor?: string;
  action?: 'receive' | 'publish';
  topic?: string;
};

export type GenericLog = {
  message: string;
  meta?: ObjectOrString;
};

export type Actor = 'Client' | 'Server' | 'Rpc Client' | 'Rpc Server';

export type CommunicationLogKeys =
  | 'actor'
  | 'action'
  | 'data'
  | 'requestId'
  | 'topic'
  | 'level';

export type CommunicationLog = {
  actor: Actor;
  action: 'receive' | 'publish';
  data: unknown;
  requestId?: string;
  topic: string;
  isDataHidden?: boolean;
  level?: LogLevel;
  error?: {
    description: string;
    message: string;
    stack: string;
  };
};
