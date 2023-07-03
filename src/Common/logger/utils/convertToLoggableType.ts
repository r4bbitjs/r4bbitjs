import { ObjectOrString } from '../logger.type';
import { isString } from '../../typeGuards/isString';
import { isObject } from '../../typeGuards/isObject';

export const convertToLoggableType = (
  input: Buffer | string | unknown
): ObjectOrString => {
  if (Buffer.isBuffer(input)) {
    return Buffer.from(input).toString();
  }

  if (isString(input) || isObject(input)) {
    return input;
  }

  return JSON.stringify(input);
};
