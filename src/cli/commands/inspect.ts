import { Command } from 'commander';
import { parsePort } from '../../validation/ports';
import { findPort, getProcessDetails } from '../../core/ports';
import { type CommonOptions } from '../options';
import {
  formatJson,
  formatInspectResult,
  formatQuietPids,
  resolveFormat,
} from '../output';

export function registerInspect(program: Command): void {
  program
    .command('inspect')
    .description('Show detailed information about a port')
    .argument('<port>', 'port number (1–65535)')
    .option('--json', 'output as JSON', false)
    .option('--quiet', 'output only PID', false)
    .option('--verbose', 'show debug information', false)
    .action(async (portArg: string, opts: CommonOptions) => {
      const port = parsePort(portArg);
      const processes = await findPort(port);
      if (processes.length === 0) {
        console.log(`No process is listening on port ${port}.`);
        return;
      }
      const detailed = await Promise.all(
        processes.map(async (process) => ({
          ...process,
          ...(await getProcessDetails(process.pid)),
        })),
      );
      const format = resolveFormat(opts);
      if (format === 'json') {
        console.log(
          formatJson({
            port,
            processes: detailed,
          }),
        );
      } else if (format === 'quiet') {
        console.log(formatQuietPids(processes));
      } else {
        console.log(
          detailed
            .map((entry) =>
              formatInspectResult({
                process: entry,
                commandLine: entry.commandLine,
                executablePath: entry.executablePath,
                user: entry.user,
                os: globalThis.process.platform,
              }),
            )
            .join('\n\n'),
        );
      }
    });
}
