import { describe, expect, it } from 'vitest';
import {
  PORT_MAX,
  PORT_MIN,
  PortValidationError,
  isValidPort,
  parsePort,
} from './ports';

describe('parsePort', () => {
  describe('valid ports', () => {
    it.each([
      [1, 1],
      [65535, 65535],
      [3000, 3000],
      [80, 80],
      [443, 443],
      ['3000', 3000],
      ['1', 1],
      ['65535', 65535],
    ])('parses %p as %p', (input, expected) => {
      expect(parsePort(input)).toBe(expected);
    });
  });

  describe('invalid ports', () => {
    it.each([0, -1, -65535, 65536, 70000, 999999])(
      'throws for out-of-range number %p',
      (input) => {
        expect(() => parsePort(input)).toThrow(PortValidationError);
        expect(() => parsePort(input)).toThrow(
          `Invalid port: ${input}\nPort must be between ${PORT_MIN} and ${PORT_MAX}.`,
        );
      },
    );

    it.each([
      '0',
      '-1',
      '65536',
      'abc',
      '',
      '3.5',
      '3000x',
      ' ',
      ' 3000',
      '0x10',
      '+3',
    ])('throws for invalid string %p', (input) => {
      expect(() => parsePort(input)).toThrow(PortValidationError);
    });

    it.each([NaN, Infinity, -Infinity])('throws for number %p', (input) => {
      expect(() => parsePort(input)).toThrow(PortValidationError);
    });
  });

  describe('bounds', () => {
    it('accepts the lower bound', () => {
      expect(parsePort(PORT_MIN)).toBe(PORT_MIN);
    });

    it('accepts the upper bound', () => {
      expect(parsePort(PORT_MAX)).toBe(PORT_MAX);
    });
  });

  describe('error messages', () => {
    it('preserves the original input on the error', () => {
      try {
        parsePort('70000');
      } catch (err) {
        expect(err).toBeInstanceOf(PortValidationError);
        expect((err as PortValidationError).input).toBe('70000');
      }
    });
  });
});

describe('isValidPort', () => {
  it('returns true for a valid port', () => {
    expect(isValidPort(3000)).toBe(true);
    expect(isValidPort('3000')).toBe(true);
  });

  it('returns false for an invalid port', () => {
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort('abc')).toBe(false);
    expect(isValidPort(70000)).toBe(false);
  });
});
