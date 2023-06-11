export type ILogger = {
  info: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
};

export type LogLevel = 'info' | 'debug' | 'error';

export type ObjectOrString = object | string;

export type LoggerOptions = {
  isPretty: boolean;
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

export type CommunicationLog = {
  actor: Actor;
  action: 'receive' | 'publish';
  data: unknown;
  requestId?: string;
  topic: string;
  isDataHidden?: boolean;
  level?: LogLevel;
};
