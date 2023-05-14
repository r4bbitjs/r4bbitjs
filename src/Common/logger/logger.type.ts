export type ILogger = {
  info: (message: unknown) => void;
  error: (message: unknown) => void;
  debug: (message: unknown) => void;
};
