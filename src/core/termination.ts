import { getPlatformAdapter } from '../platform';

export type TerminationSignal = 'SIGTERM' | 'SIGKILL';

export class ProcessTerminationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessTerminationError';
  }
}

export async function terminateProcess(
  pid: number,
  signal: TerminationSignal = 'SIGTERM',
): Promise<boolean> {
  if (!Number.isSafeInteger(pid) || pid <= 0) {
    throw new ProcessTerminationError(`Invalid process ID: ${pid}.`);
  }
  if (pid === process.pid) {
    throw new ProcessTerminationError(
      'Refusing to terminate the current process.',
    );
  }
  const adapter = getPlatformAdapter();
  return adapter.terminateProcess(pid, signal);
}
