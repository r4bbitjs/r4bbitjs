import { colorizedStringify } from './colorizedStringify';

describe('colorizedStringify', () => {
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

  const expectedExample = '';

  //   console.log(colorizedStringify(example));
  it('should flatten the object and colorize it', () => {
    expect(colorizedStringify(example)).toEqual(expectedExample);
  });

  it('Should work with a number', () => {
    const one = 1;

    const colorizedString = colorizedStringify(one);
    console.log(JSON.stringify(colorizedString));

    expect(colorizedString === `\u001b[37m1\u001b[39m`).toBeTruthy();
  });
});
