import { Command } from 'commander';
import { parsePort } from '../../validation/ports';
import { listPorts } from '../../core/ports';
import { sortByPort } from '../../core/processes';
import { type CommonOptions } from '../options';
import { formatJson, formatListTable, resolveFormat } from '../output';

function toListJson(p: {
  port: number;
  pid: number;
  processName?: string;
  address: string;
}) {
  return {
    port: p.port,
    pid: p.pid,
    processName: p.processName ?? 'unknown',
    address: p.address,
  };
}

export function registerList(program: Command): void {
  program
    .command('list')
    .description('List all listening TCP ports')
    .option('--process <name>', 'filter by process name')
    .option('--port <port>', 'filter by port number')
    .option('--json', 'output as JSON', false)
    .option('--quiet', 'output only port numbers', false)
    .option('--verbose', 'show debug information', false)
    .action(async (opts: CommonOptions) => {
      const port =
        opts.port !== undefined ? parsePort(String(opts.port)) : undefined;
      const processes = sortByPort(
        await listPorts({ process: opts.process, port }),
      );
      const format = resolveFormat(opts);
      if (format === 'json') {
        console.log(formatJson({ processes: processes.map(toListJson) }));
      } else if (format === 'quiet') {
        console.log(processes.map((p) => String(p.port)).join('\n'));
      } else {
        console.log(formatListTable({ processes }));
      }
    });
}
