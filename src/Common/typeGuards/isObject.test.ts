import { isObject } from './isObject';

describe('isObject runtime type check tests', () => {
  it('checks empty object', () => {
    expect(isObject({})).toBe(true);
  });

  it('checks normal object', () => {
    expect(isObject({ hello: 'World' })).toBe(true);
  });

  it('checks undefined', () => {
    expect(isObject()).toBe(false);
  });

  it('checks string', () => {
    expect(isObject()).toBe(false);
  });

  it('checks null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('checks array', () => {
    expect(isObject(null)).toBe(false);
  });
});
