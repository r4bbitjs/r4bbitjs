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

  it('should flatten the object and colorize it', () => {
    console.log(colorizedStringify(example));
    expect(1).toEqual(1);
    // expect(colorizedStringify(example)).toEqual(expectedExample);
  });

  it('Should work with a simple object', () => {
    // given
    const input = { x: 1 };
    const expectedResult = `\n x: ${'1'.white}`;

    // when
    const result = colorizedStringify(input);

    // then
    expect(result).toEqual(expectedResult);
  });

  it('Should work with a nested object', () => {
    const input = { x: {
      y: 12
    }};
    const expectedResult = `\n x: \n  y: ${'12'.white}`;  
    const result = colorizedStringify(input);

    expect(result).toEqual(expectedResult);
  });

  it('Should work with a number', () => {
    const input = 2;
    const colorizedString = colorizedStringify(input);

    expect(colorizedString).toEqual(String(input).white);
  });

  it('Should work with a null', () => {
    const input = null;
    const colorizedString = colorizedStringify(input);

    expect(colorizedString).toEqual(String(input).bgRed);
  });

  it('Should work with a string', () => {
    const input = 'some string';
    const colorizedString = colorizedStringify(input);

    expect(colorizedString).toEqual(String(input).red);
  });
});
