import chalk from 'chalk';
import { ColorKeys, ColorizeFn, Colors } from './colorMap.type';

export const monokaiColors = {
  Background: '#2e2e2e',
  Comments: '#797979',
  White: '#d6d6d6',
  Yellow: '#e5b567',
  Green: '#b4d273',
  Orange: '#e87d3e',
  Purple: '#9e86c8',
  Pink: '#b05279',
  Blue: '#6c99bb',
  Red: '#FF6188',
};

export const monokaiColorTheme: Colors = {
  basic: monokaiColors.Green,
  key: monokaiColors.Blue,
  string: monokaiColors.Purple,
  number: monokaiColors.White,
  boolean: monokaiColors.Background,
  null: monokaiColors.Pink,
  undefined: monokaiColors.Pink,
  array: monokaiColors.Red,
};

const returnString = (str: string) => str;

export class ColorTheme {
  private static _colors: Colors = monokaiColorTheme;
  private static _isColor = true;

  static set colors(value: Colors) {
    this._colors = {
      ...this._colors,
      ...value,
    };
  }

  static colorize(key: ColorKeys = 'basic'): ColorizeFn {
    const color = this._colors[key] ?? (this._colors['basic'] as string);
    if (this._isColor) {
      if (key === 'key') {
        return chalk.hex(color).italic;
      }
      return chalk.hex(color);
    }

    return returnString;
  }

  static customColorize(color: string, isItalic: boolean): ColorizeFn {
    if (this._isColor) {
      if (isItalic) {
        return chalk.hex(color).italic;
      }

      return chalk.hex(color);
    }

    return returnString;
  }

  static set isColor(value: boolean) {
    this._isColor = value;
  }
}
