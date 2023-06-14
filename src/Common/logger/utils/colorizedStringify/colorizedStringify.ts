import colors from 'colors';
colors.enable();

export const colorizedStringify = (obj: unknown) => {
  if (typeof obj === 'number') {
    console.log('ITS A NUMBER', obj);
    return String(obj).white;
  }

  if (typeof obj === 'string') {
    return obj.red;
  }

  if (obj === null) {
    return 'null'.white;
  }

  if (typeof obj === 'object') {
    return colorizeObject(obj);
  }

  // TODO: array
};

const colorizeObject = (obj: object): string => {
  return Object.entries(obj)
    .map(([key, value]) => `\n${key}: ${colorizedStringify(value)}`)
    .join('\n');
};

const example = {
  x: {
    y: {
      z: 1,
    },
    y2: {
      z: 2,
    },
  },
};

console.log(colorizedStringify(example));
