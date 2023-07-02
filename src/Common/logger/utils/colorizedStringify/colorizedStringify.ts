import { isObject } from '../../../typeGuards/isObject';
import { isString } from '../../../typeGuards/isString';
import chalk from 'chalk';
import { monokaiColorTheme, colorMap } from './colorMap';

const {
  colorizeBoolean,
  colorizeNull,
  colorizeNumber,
  colorizeString,
  colorizeArray,
} = colorMap;

const SEPARATOR = ' ';

const levelWhiteSpace = (level: number): string => SEPARATOR.repeat(level);

export const colorizedStringify = (
  obj: unknown,
  colorMap: Record<string, string> = {},
  level = 0
  isColor = true,
): string => {
  if (typeof obj === 'number') {
    return colorizeNumber(String(obj));
  }

  if (isString(obj)) {
    return colorizeString(obj);
  }

  if (typeof obj === 'boolean') {
    return colorizeBoolean(String(obj));
  }

  if (obj === null) {
    return colorizeNull('null');
  }

  if (isObject(obj)) {
    return colorizeObject(obj, colorMap, level);
  }

  if (Array.isArray(obj)) {
    const content = obj
      .map((item: unknown) => colorizedStringify(item, colorMap, 0))
      .join(colorizeArray(', '));

    return `${colorizeArray('[')}${content}${colorizeArray(']')}`;
  }

  return '';
};

const colorizeObject = (
  obj: object,
  colorMap: Record<string, string>,
  level = 0
): string => {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (colorMap[key]) {
        colorMap.root = colorMap[key];
      }

      const coloredKey = colorMap['root']
        ? chalk.hex(colorMap['root']).italic(key)
        : chalk.hex(monokaiColorTheme.Green).italic(key);

      return `\n${levelWhiteSpace(level)}${
        coloredKey + ':'
      } ${colorizedStringify(value, colorMap, level + 1)}`;
    })
    .join('');
};
