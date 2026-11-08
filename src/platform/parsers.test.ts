import { describe, expect, it } from 'vitest';
import { parseLsof, parseSs } from './unix';
import { parseNetstat } from './windows';

describe('unix listener parsers', () => {
  it('parses ss output with process metadata', () => {
    const output =
      'LISTEN 0 511 127.0.0.1:3000 0.0.0.0:* users:(("node",pid=123,fd=8))';
    expect(parseSs(output)).toEqual([
      {
        address: '127.0.0.1',
        port: 3000,
        protocol: 'tcp',
        pid: 123,
        processName: 'node',
      },
    ]);
  });

  it('parses lsof output', () => {
    const output =
      'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME\nnode 123 alice 8u IPv4 1 0t0 TCP 127.0.0.1:3000 (LISTEN)';
    expect(parseLsof(output)).toEqual([
      {
        processName: 'node',
        pid: 123,
        user: 'alice',
        address: '127.0.0.1',
        port: 3000,
        protocol: 'tcp',
      },
    ]);
  });
});

describe('windows listener parser', () => {
  it('parses netstat listening rows', () => {
    const output = '  TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    123\n';
    expect(parseNetstat(output)).toEqual([
      {
        address: '0.0.0.0',
        port: 3000,
        pid: 123,
        protocol: 'tcp',
      },
    ]);
  });
});
