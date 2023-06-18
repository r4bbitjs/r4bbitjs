import colors from 'colors';
import { isObject } from '../../../typeGuards/isObject';
import { isString } from '../../../typeGuards/isString';
colors.enable();

const SEPARATOR = ' ';

const levelWhiteSpace = (level: number): string => SEPARATOR.repeat(level);

export const colorizedStringify = (obj: unknown, level: number = 0): string => {
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
    return  'null'.bgRed;
  }
  
  
  if (isObject(obj)) {
    return colorizeObject(obj, level);
  }

  if (Array.isArray(obj)) {
    const content = obj
      .map((item: unknown) => colorizedStringify(item, 0))
      .join(', ')

    return `[${content}]`
  }

  return '';
};

const colorizeObject = (obj: object, level: number = 0): string => {
  return Object.entries(obj)
  .map(([key, value]) => `\n${levelWhiteSpace(level)}${(key + ':').bgRed} ${colorizedStringify(value, level + 1)}`)
  .join('');
};

const example = {
  x: {
    y: {
      z: 1,
    },
    y2: { 
      z: 2,
    },
    y3: {
      arr: [1, 2, 'text', true, null]
    }
  },
};

console.log(colorizedStringify(example));