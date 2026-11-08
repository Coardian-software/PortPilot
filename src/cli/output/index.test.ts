import { describe, expect, it } from 'vitest';
import {
  formatFindResult,
  formatInspectResult,
  formatJson,
  formatListTable,
  formatProcessListBrief,
  formatProcessTable,
  formatQuietPids,
  resolveFormat,
} from './index';
import type { PortProcess } from '../../platform/types';

const proc: PortProcess = {
  pid: 18231,
  port: 3000,
  protocol: 'tcp',
  address: '127.0.0.1',
  processName: 'node',
  executablePath: '/usr/bin/node',
  commandLine: 'node server.js',
  user: 'aydocs',
};

describe('resolveFormat', () => {
  it('prefers json over quiet', () => {
    expect(resolveFormat({ json: true, quiet: true })).toBe('json');
  });

  it('returns quiet when set', () => {
    expect(resolveFormat({ quiet: true })).toBe('quiet');
  });

  it('defaults to table', () => {
    expect(resolveFormat({})).toBe('table');
    expect(resolveFormat({ json: false })).toBe('table');
  });
});

describe('formatJson', () => {
  it('produces indented JSON', () => {
    expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});

describe('formatFindResult', () => {
  it('returns a message when no processes are found', () => {
    expect(formatFindResult({ port: 3000, processes: [] })).toBe(
      'No process is listening on port 3000.',
    );
  });

  it('returns header and table when processes are found', () => {
    const out = formatFindResult({ port: 3000, processes: [proc] });
    expect(out).toContain('Port 3000');
    expect(out).toContain('PID');
    expect(out).toContain('18231');
    expect(out).toContain('node');
    expect(out).toContain('127.0.0.1:3000');
  });
});

describe('formatProcessTable', () => {
  it('returns empty string for empty array', () => {
    expect(formatProcessTable([])).toBe('');
  });

  it('formats a single row', () => {
    const out = formatProcessTable([proc]);
    expect(out).toContain('18231');
    expect(out).toContain('node');
    expect(out).toContain('127.0.0.1:3000');
  });

  it('aligns columns with a divider containing gaps', () => {
    const out = formatProcessTable([proc]);
    const lines = out.split('\n');
    expect(lines[1]).toMatch(/^─+(\s+─+)*$/);
  });
});

describe('formatListTable', () => {
  it('returns a message for empty results', () => {
    expect(formatListTable({ processes: [] })).toBe(
      'No listening ports found.',
    );
  });

  it('includes all expected headers', () => {
    const out = formatListTable({ processes: [proc] });
    expect(out).toContain('PORT');
    expect(out).toContain('PID');
    expect(out).toContain('PROCESS');
    expect(out).toContain('ADDRESS');
    expect(out).toContain('3000');
  });
});

describe('formatQuietPids', () => {
  it('returns PIDs joined by newline', () => {
    expect(formatQuietPids([proc, { ...proc, pid: 19382 }])).toBe(
      '18231\n19382',
    );
  });

  it('returns empty string for empty array', () => {
    expect(formatQuietPids([])).toBe('');
  });
});

describe('formatInspectResult', () => {
  const inspect = {
    process: proc,
    commandLine: 'node server.js',
    user: 'aydocs',
    os: 'linux',
  };

  it('formats key/value pairs aligned', () => {
    const out = formatInspectResult(inspect);
    expect(out).toContain('Port:');
    expect(out).toContain('3000');
    expect(out).toContain('Protocol:');
    expect(out).toContain('TCP');
    expect(out).toContain('PID:');
    expect(out).toContain('18231');
    expect(out).toContain('Process:');
    expect(out).toContain('node');
    expect(out).toContain('Address:');
    expect(out).toContain('127.0.0.1:3000');
    expect(out).toContain('Command:');
    expect(out).toContain('node server.js');
    expect(out).toContain('User:');
    expect(out).toContain('aydocs');
    expect(out).toContain('OS:');
    expect(out).toContain('linux');
  });

  it('shows executablePath when commandLine is missing', () => {
    const noCmd = {
      process: proc,
      executablePath: '/usr/bin/node',
      os: 'linux',
    };
    const out = formatInspectResult(noCmd);
    expect(out).toContain('Executable:');
    expect(out).not.toContain('Command:');
  });

  it('omits empty user field', () => {
    const noUser = { process: proc, os: 'linux' };
    const out = formatInspectResult(noUser);
    expect(out).not.toContain('User:');
  });
});

describe('formatProcessListBrief', () => {
  it('formats a brief process list', () => {
    const out = formatProcessListBrief([proc]);
    expect(out).toContain('Port is being used by:');
    expect(out).toContain('PID: 18231');
    expect(out).toContain('Process: node');
  });
});
