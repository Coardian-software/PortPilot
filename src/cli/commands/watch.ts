import { Command } from 'commander';
import { CliError } from '../errors';
import { listPorts } from '../../core/ports';
import { type CommonOptions } from '../options';
import { formatJson, formatListTable, resolveFormat } from '../output';

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

export function parseInterval(input: string): number {
  if (!/^\d+$/.test(input)) {
    throw new CliError('Invalid interval: must be a positive integer.', 2);
  }
  const interval = Number(input);
  if (!Number.isSafeInteger(interval) || interval <= 0) {
    throw new CliError('Invalid interval: must be a positive integer.', 2);
  }
  return interval;
}

export function registerWatch(program: Command): void {
  program
    .command('watch')
    .description('Continuously monitor listening ports')
    .option('--interval <ms>', 'polling interval in milliseconds', '1000')
    .option('--json', 'output as JSON', false)
    .option('--quiet', 'output only port numbers', false)
    .option('--verbose', 'show debug information', false)
    .action(async (opts: CommonOptions) => {
      const interval = parseInterval(opts.interval ?? '1000');
      const format = resolveFormat(opts);
      let previous = new Set<string>();
      let first = true;
      while (true) {
        const processes = await listPorts();
        const current = new Set(processes.map((p) => `${p.port}:${p.pid}`));
        const changed =
          first ||
          current.size !== previous.size ||
          [...current].some((key) => !previous.has(key));
        if (changed) {
          if (!first && format === 'table') console.log('');
          if (format === 'json') {
            console.log(
              formatJson({
                timestamp: new Date().toISOString(),
                processes: processes.map(toFindJson),
              }),
            );
          } else if (format === 'quiet') {
            console.log(processes.map((p) => String(p.port)).join('\n'));
          } else {
            console.log(formatListTable({ processes }));
          }
        }
        previous = current;
        first = false;
        await new Promise<void>((resolve) => setTimeout(resolve, interval));
      }
    });
}
