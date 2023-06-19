import { Colors } from '../src/Common/logger/colors.type';
import {
  CommunicationLog,
  CommunicationLogKeys,
} from '../src/Common/logger/logger.type';
import { colorizedStringify } from '../src/Common/logger/utils/colorizedStringify/colorizedStringify';
import chalk from 'chalk';

const colorTable: Record<string, Colors> = {
  actor: 'bold',
  action: 'blue',
  topic: 'magenta',
  requestId: 'yellow',
  data: 'cyan',
  level: 'white',
  error: 'red',
};

const prepareLog = (communicationLog: CommunicationLog): string => {
  delete communicationLog.isDataHidden;

  return (
    Object.entries(communicationLog)
      .map(([key, value]) => {
        const warning = chalk.hex('#FFD866');
        const keyColored = warning(key);
        const propertyColor = colorTable[key as CommunicationLogKeys];
        const colorMap: Record<string, Colors> = {
          signature: 'red',
          headers: 'blue',
          content: 'bgCyan',
        };

        if (key === 'data') {
          return `${keyColored}: ${colorizedStringify(value, colorMap)}`;
        }

        if (key === 'error') {
          return colorizedStringify({ error: value }, colorMap);
        }

        return `${keyColored}: ${
          String(value)[propertyColor as unknown as number]
        }`;
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
