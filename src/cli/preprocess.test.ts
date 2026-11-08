import { describe, expect, it } from 'vitest';
import { preprocessArgv } from './preprocess';

describe('preprocessArgv', () => {
  it('leaves normal subcommands unchanged', () => {
    expect(preprocessArgv(['node', 'portpilot', 'find', '3000'])).toEqual([
      'node',
      'portpilot',
      'find',
      '3000',
    ]);
  });

  it('rewrites a bare port number to find', () => {
    expect(preprocessArgv(['node', 'portpilot', '3000'])).toEqual([
      'node',
      'portpilot',
      'find',
      '3000',
    ]);
  });

  it('rewrites --port N to find N', () => {
    expect(preprocessArgv(['node', 'portpilot', '--port', '3000'])).toEqual([
      'node',
      'portpilot',
      'find',
      '3000',
    ]);
  });

  it('rewrites -p N to find N', () => {
    expect(preprocessArgv(['node', 'portpilot', '-p', '3000'])).toEqual([
      'node',
      'portpilot',
      'find',
      '3000',
    ]);
  });

  it('rewrites --port=N to find N', () => {
    expect(preprocessArgv(['node', 'portpilot', '--port=3000'])).toEqual([
      'node',
      'portpilot',
      'find',
      '3000',
    ]);
  });

  it('preserves extra flags after --port', () => {
    expect(
      preprocessArgv(['node', 'portpilot', '--port', '3000', '--json']),
    ).toEqual(['node', 'portpilot', 'find', '3000', '--json']);
  });

  it('does not rewrite unknown subcommands', () => {
    expect(preprocessArgv(['node', 'portpilot', 'bogus'])).toEqual([
      'node',
      'portpilot',
      'bogus',
    ]);
  });
});
