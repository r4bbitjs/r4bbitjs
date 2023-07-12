import chalk from 'chalk';
import {
  CommunicationLog,
  CommunicationLogKeys,
} from '../src/Common/logger/logger.type';
import { colorizedStringify } from '../src/Common/logger/utils/colorizedStringify/colorizedStringify';
import {
  colorMap,
  monokaiColorTheme,
} from '../src/Common/logger/utils/colorizedStringify/colorMap';

const colorTable: Record<string, chalk.Chalk> = {
  actor: chalk.hex(monokaiColorTheme.Green),
  action: chalk.hex(monokaiColorTheme.Green),
  topic: chalk.hex(monokaiColorTheme.Green),
  requestId: chalk.hex(monokaiColorTheme.Green),
  data: chalk.hex(monokaiColorTheme.Green),
  level: chalk.hex(monokaiColorTheme.Green),
  error: chalk.hex(monokaiColorTheme.Green),
};

const prepareLog = (communicationLog: CommunicationLog): string => {
  delete communicationLog.isDataHidden;

  const { colorizeKey } = colorMap;

  return (
    Object.entries(communicationLog)
      .map(([key, value]) => {
        const colorizeMethod = colorTable[key as CommunicationLogKeys];
        const colorMap: Record<string, string> = {
          signature: monokaiColorTheme.Green,
          headers: monokaiColorTheme.Yellow,
          content: monokaiColorTheme.Orange,
        };

        if (key === 'data') {
          return `${colorizeKey(key)}: ${colorizedStringify(
            value,
            colorMap,
            1
          )}`;
        }

        if (key === 'error') {
          return `${colorizeKey(key)}: ${colorizedStringify(value, {}, 1)}`;
        }

        return `${colorizeKey(key)}: ${colorizeMethod(value)}`;
      })
      .join('\n') + '\n'
  );
};

const example: CommunicationLog = {
  data: {
    headers: {
      'x-send-type': 'json',
      'x-send-type2': 'json',
      'x-send-type3': 'json',
    },
    content: {
      test: 'test',
      test2: 123,
      test3: {
        test4: 'test4',
        test5: true,
      },
      test6: [1, 2, 3],
      test7: null,
    },
  },
  actor: 'Server',
  topic: '*.test2',
  action: 'receive',
};

console.log(prepareLog(example));
