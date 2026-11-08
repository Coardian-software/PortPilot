#!/usr/bin/env node
import { Command, CommanderError } from 'commander';
import { CliError } from './errors';
import { getVersion } from './version';
import { preprocessArgv } from './preprocess';
import { registerFind } from './commands/find';
import { registerInspect } from './commands/inspect';
import { registerKill } from './commands/kill';
import { registerFree } from './commands/free';
import { registerList } from './commands/list';
import { registerWatch } from './commands/watch';
import { PlatformCapabilityError } from '../platform/types';
import { ProcessTerminationError } from '../core/termination';
import { PortValidationError } from '../validation/ports';

const VERSION = getVersion();

const program = new Command();

process.argv = preprocessArgv(process.argv);

program
  .name('portpilot')
  .description('A fast CLI for finding and managing processes on TCP ports.')
  .version(VERSION, '-v, --version', 'output the version number')
  .exitOverride()
  .action(() => program.outputHelp());

registerFind(program);
registerInspect(program);
registerKill(program);
registerFree(program);
registerList(program);
registerWatch(program);

async function main(): Promise<number> {
  try {
    await program.parseAsync(process.argv);
    return 0;
  } catch (err) {
    if (err instanceof PortValidationError) {
      console.error(err.message);
      return 2;
    }
    if (err instanceof PlatformCapabilityError) {
      console.error(err.message);
      return 1;
    }
    if (err instanceof ProcessTerminationError) {
      console.error(err.message);
      return 5;
    }
    if (err instanceof CliError) {
      console.error(err.message);
      return err.exitCode;
    }
    if (err instanceof CommanderError) {
      if (err.exitCode === 0) return 0;
      console.error(err.message);
      return err.exitCode || 1;
    }
    if (err instanceof Error) {
      if (process.env.PORTPILOT_DEBUG) {
        console.error(err);
      } else {
        console.error(err.message);
      }
      return 1;
    }
    console.error(String(err));
    return 1;
  }
}

const code = await main();
process.exitCode = code;
