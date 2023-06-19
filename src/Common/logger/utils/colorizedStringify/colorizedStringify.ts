import colors from 'colors';
import { isObject } from '../../../typeGuards/isObject';
import { isString } from '../../../typeGuards/isString';
import { Colors } from '../../colors.type';
colors.enable();

const SEPARATOR = ' ';

const levelWhiteSpace = (level: number): string => SEPARATOR.repeat(level);

export const colorizedStringify = (
  obj: unknown,
  colorMap: Record<string, Colors> = {},
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
      .map((item: unknown) => colorizedStringify(item, colorMap, 0))
      .join(', ');

    return `[${content}]`;
  }

  return '';
};

const colorizeObject = (
  obj: object,
  colorMap: Record<string, Colors>,
  level = 0
): string => {
  return Object.entries(obj)
    .map(([key, value]) => {
      let current = 'white';

      if (colorMap['root']) {
        current = colorMap['root'];
      }

      if (colorMap[key]) {
        current = colorMap[key];
        colorMap.root = colorMap[key];
      }

      return `\n${levelWhiteSpace(level)}${
        (key + ':')[current as unknown as number]
      } ${colorizedStringify(value, colorMap, level + 1)}`;
    })
    .join('');
};
