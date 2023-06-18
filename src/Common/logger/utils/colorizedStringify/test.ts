import colors from 'colors';
import { isObject } from '../../../typeGuards/isObject';
import { isString } from '../../../typeGuards/isString';
colors.enable();

const SEPARATOR = ' ';

const levelWhiteSpace = (level: number): string => SEPARATOR.repeat(level);

export const colorizedStringify3 = <T>(
  obj: T,
  colorMap: Record<keyof T, string>,
  level = 0
): string => {
  if (typeof obj === 'number') {
    return String(obj).bgBlue;
  }

  if (isString(obj)) {
    return obj.red;
  }

  if (typeof obj === 'boolean') {
    return String(obj).green;
  }

  if (obj === null) {
    return 'null'.bgRed;
  }

  if (isObject(obj)) {
    return colorizeObject(obj, colorMap, level);
  }

  if (Array.isArray(obj)) {
    const content = obj
      .map((item: unknown) => colorizedStringify3(item, colorMap, 0))
      .join(', ');

    return `[${content}]`;
  }

  return '';
};

const colorizeObject = <T extends Record<string, unknown>>(
  obj: T,
  colorMap: Record<keyof T, string>,
  level = 0
): string => {
  return Object.entries(obj)
    .map(([key, value]) => {
      return `\n${levelWhiteSpace(level)}${
        (key + ':')[colorMap[key as keyof T] as unknown as number]
      } ${colorizedStringify3(value, colorMap, level + 1)}`;
    })
    .join('');
};
