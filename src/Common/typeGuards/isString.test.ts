import { isString } from './isString';

describe('isString runtime type check tests', () => {
  it('checks if input is string', () => {
    expect(isString('test string')).toBe(true);
  });

  it('checks undefined', () => {
    expect(isString(undefined)).toBe(false);
  });

  it('checks null', () => {
    expect(isString(null)).toBe(false);
  });

  it('checks number', () => {
    expect(isString(12)).toBe(false);
  });

  it('checks array', () => {
    expect(isString([])).toBe(false);
  });
});
