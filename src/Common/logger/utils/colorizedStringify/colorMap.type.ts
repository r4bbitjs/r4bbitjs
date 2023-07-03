export type Colors = {
  basic?: string;
  key?: string;
  string?: string;
  number?: string;
  boolean?: string;
  null?: string;
  undefined?: string;
  array?: string;
};

export type ColorKeys =
  | 'basic'
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'array';

export type ColorizeFn = (key: string) => string;
