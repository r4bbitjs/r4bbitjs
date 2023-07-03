import { isObject } from '../../../typeGuards/isObject';
import { isString } from '../../../typeGuards/isString';
import { ColorTheme } from './colorMap';

const SEPARATOR = ' ';

const levelWhiteSpace = (level: number): string => SEPARATOR.repeat(level);

export const colorizedStringify = (
  obj: unknown,
  colorMap: Record<string, string> = {},
  level = 0
): string => {
  if (typeof obj === 'number') {
    return ColorTheme.colorize('number')(String(obj));
  }

  if (isString(obj)) {
    return ColorTheme.colorize('string')(obj);
  }

  if (typeof obj === 'boolean') {
    return ColorTheme.colorize('boolean')(String(obj));
  }

  if (obj === null) {
    return ColorTheme.colorize('null')('null');
  }

  if (isObject(obj)) {
    return colorizeObject(obj, colorMap, level);
  }

  if (Array.isArray(obj)) {
    const content = obj
      .map((item: unknown) => colorizedStringify(item, colorMap, 0))
      .join(ColorTheme.colorize('array')(', '));

    return `${ColorTheme.colorize('array')('[')}${content}${ColorTheme.colorize(
      'array'
    )(']')}`;
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
        ? ColorTheme.customColorize(colorMap['root'], true)(key)
        : ColorTheme.colorize('key')(key);

      return `\n${levelWhiteSpace(level)}${
        coloredKey + ':'
      } ${colorizedStringify(value, colorMap, level + 1)}`;
    })
    .join('');
};
