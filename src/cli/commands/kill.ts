import { Command } from 'commander';
import { parsePort } from '../../validation/ports';
import { findPort } from '../../core/ports';
import { terminateProcess } from '../../core/termination';
import { CliError } from '../errors';
import { type CommonOptions } from '../options';
import { confirm } from '../confirm';
import {
  formatJson,
  formatProcessListBrief,
  formatQuietPids,
  resolveFormat,
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

export function registerKill(program: Command): void {
  program
    .command('kill')
    .description('Kill a process listening on a TCP port')
    .argument('<port>', 'port number (1–65535)')
    .option('--force', 'skip confirmation', false)
    .option('--json', 'output as JSON', false)
    .option('--quiet', 'output only PIDs', false)
    .option('--verbose', 'show debug information', false)
    .action(
      async (portArg: string, opts: CommonOptions & { force?: boolean }) => {
        const port = parsePort(portArg);
        const processes = await findPort(port);
        if (processes.length === 0) {
          throw new CliError(`No process is listening on port ${port}.`, 3);
        }
        if (!opts.force) {
          const accepted = await confirm(
            `Terminate ${processes.length} process(es) listening on port ${port}?`,
          );
          if (!accepted) throw new CliError('Termination cancelled.', 1);
        }
        const results = await Promise.all(
          processes.map(async (process) => {
            try {
              return {
                ...toFindJson(process),
                terminated: await terminateProcess(process.pid),
              };
            } catch {
              return { ...toFindJson(process), terminated: false };
            }
          }),
        );
        const failed = results.some((result) => !result.terminated);
        const format = resolveFormat(opts);
        if (format === 'json') {
          console.log(formatJson({ port, processes: results }));
        } else if (format === 'quiet') {
          console.log(
            formatQuietPids(
              processes.filter((_, index) => results[index]?.terminated),
            ),
          );
        } else {
          console.log(formatProcessListBrief(processes));
        }
        if (failed)
          throw new CliError(
            'One or more processes could not be terminated.',
            5,
          );
      },
    );
}
