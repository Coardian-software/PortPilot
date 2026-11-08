import { describe, expect, it } from 'vitest';
import { CliError } from '../errors';
import { parseInterval } from './watch';

describe('parseInterval', () => {
  it('accepts positive integer milliseconds', () => {
    expect(parseInterval('1000')).toBe(1000);
  });

  it.each(['0', '-1', '1.5', '1000ms', '', '9007199254740992'])(
    'rejects invalid interval %p',
    (input) => {
      expect(() => parseInterval(input)).toThrow(CliError);
      expect(() => parseInterval(input)).toThrow(
        'Invalid interval: must be a positive integer.',
      );
    },
  );
});
