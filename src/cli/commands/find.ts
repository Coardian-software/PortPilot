import { Command } from 'commander';
import { parsePort } from '../../validation/ports';
import { findPort } from '../../core/ports';
import { type CommonOptions } from '../options';
import {
  formatFindResult,
  formatJson,
  formatQuietPids,
  resolveFormat,
  type FindResult,
} from '../output';

function toFindJson(p: {
  pid: number;
  processName?: string;
  address: string;
  protocol: string;
}) {
  return {
    pid: p.pid,
    processName: p.processName ?? 'unknown',
    address: p.address,
    protocol: p.protocol,
  };
}

export function registerFind(program: Command): void {
  program
    .command('find')
    .description('Find processes listening on a TCP port')
    .argument('<port>', 'port number (1–65535)')
    .option('--json', 'output as JSON', false)
    .option('--quiet', 'output only PIDs', false)
    .option('--verbose', 'show debug information', false)
    .action(async (portArg: string, opts: CommonOptions) => {
      const port = parsePort(portArg);
      const processes = await findPort(port);
      const format = resolveFormat(opts);
      const result: FindResult = { port, processes };
      if (format === 'json') {
        console.log(formatJson({ port, processes: processes.map(toFindJson) }));
      } else if (format === 'quiet') {
        console.log(formatQuietPids(processes));
      } else {
        console.log(formatFindResult(result));
      }
    });
}
