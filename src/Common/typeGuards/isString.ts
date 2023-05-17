export const isString = (input?: unknown): input is string => {
  return typeof input === 'string';
};
