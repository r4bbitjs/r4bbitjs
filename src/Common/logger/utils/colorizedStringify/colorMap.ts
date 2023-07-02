import chalk from 'chalk';

export const monokaiColorTheme = {
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

const returnWhatTakes = (str: string) => str;

export const colorMap = (isColor = true) => ({
  colorizeKey: isColor
    ? chalk.hex(monokaiColorTheme.Blue).italic
    : returnWhatTakes,
  colorizeString: chalk.hex(monokaiColorTheme.Purple),
  colorizeNumber: chalk.hex(monokaiColorTheme.White),
  colorizeBoolean: chalk.hex(monokaiColorTheme.Background),
  colorizeNull: chalk.hex(monokaiColorTheme.Pink),
  colorizeUndefined: chalk.hex(monokaiColorTheme.Pink),
  colorizeArray: chalk.hex(monokaiColorTheme.Red),
});
