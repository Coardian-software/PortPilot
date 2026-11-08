import type { PortProcess } from '../platform/types';
import { getPlatformAdapter } from '../platform';

export interface FindOptions {
  timeout?: number;
}

export interface ListOptions {
  process?: string;
  port?: number;
}

export async function findPort(
  port: number,
  _options?: FindOptions,
): Promise<PortProcess[]> {
  const adapter = getPlatformAdapter();
  return adapter.findProcessesOnPort(port);
}

export async function listPorts(options?: ListOptions): Promise<PortProcess[]> {
  const adapter = getPlatformAdapter();
  const all = await adapter.listListeningProcesses();
  return all.filter((p) => {
    if (options?.port !== undefined && p.port !== options.port) return false;
    if (options?.process !== undefined) {
      const name = p.processName ?? '';
      if (!name.toLowerCase().includes(options.process.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

export async function getProcessDetails(pid: number): Promise<PortProcess> {
  const adapter = getPlatformAdapter();
  const [base, details] = await Promise.all([
    findPortForPid(pid, adapter),
    adapter.getProcessDetails(pid),
  ]);
  if (!base) {
    throw new Error(`No listening process found for PID ${pid}.`);
  }
  return { ...base, ...details };
}

async function findPortForPid(
  pid: number,
  adapter: { listListeningProcesses(): Promise<PortProcess[]> },
): Promise<PortProcess | undefined> {
  const all = await adapter.listListeningProcesses();
  return all.find((p) => p.pid === pid);
}
