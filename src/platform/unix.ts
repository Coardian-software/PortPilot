import { runCommand } from './command';
import type { PlatformAdapter, PortProcess } from './types';
import { PlatformCapabilityError } from './types';

function parseEndpoint(
  endpoint: string,
): { address: string; port: number } | undefined {
  const value = endpoint.trim();
  const ipv6 = value.match(/^\[(.*)\]:(\d+)$/);
  if (ipv6) return { address: ipv6[1], port: Number(ipv6[2]) };
  const separator = value.lastIndexOf(':');
  if (separator < 1) return undefined;
  const port = Number(value.slice(separator + 1));
  if (!Number.isInteger(port)) return undefined;
  return { address: value.slice(0, separator), port };
}

export function parseSs(output: string): PortProcess[] {
  const processes: PortProcess[] = [];
  for (const line of output.split('\n')) {
    const match = line.match(/^\S+\s+\S+\s+\S+\s+(\S+)\s+\S+\s*(.*)$/);
    if (!match) continue;
    const endpoint = parseEndpoint(match[1]);
    if (!endpoint) continue;
    const users = match[2].matchAll(/\("([^"]+)",pid=(\d+)/g);
    const found = [...users];
    if (found.length === 0) {
      processes.push({ ...endpoint, protocol: 'tcp', pid: 0 });
      continue;
    }
    for (const user of found) {
      processes.push({
        ...endpoint,
        protocol: 'tcp',
        processName: user[1],
        pid: Number(user[2]),
      });
    }
  }
  return processes.filter((process) => process.pid > 0);
}

export function parseLsof(output: string): PortProcess[] {
  const processes: PortProcess[] = [];
  for (const line of output.split('\n').slice(1)) {
    const fields = line.trim().split(/\s+/);
    if (fields.length < 9) continue;
    const portMatch = fields[8].match(/^(.*):(\d+)$/);
    if (!portMatch) continue;
    processes.push({
      processName: fields[0],
      pid: Number(fields[1]),
      user: fields[2],
      address: portMatch[1],
      port: Number(portMatch[2]),
      protocol: 'tcp',
    });
  }
  return processes.filter((process) => process.pid > 0 && process.port > 0);
}

async function discover(): Promise<PortProcess[]> {
  const ss = await runCommand('ss', ['-ltnpH']);
  const fromSs = parseSs(ss.stdout);
  if (fromSs.length > 0) return fromSs;
  const lsof = await runCommand('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN']);
  if (ss.exitCode !== 0 && lsof.exitCode !== 0) {
    throw new PlatformCapabilityError(
      'Could not discover listening ports: install ss or lsof and try again.',
    );
  }
  return parseLsof(lsof.stdout);
}

async function details(
  pid: number,
  platform: NodeJS.Platform,
): Promise<Partial<PortProcess>> {
  const [ps, exe] = await Promise.all([
    runCommand('ps', ['-p', String(pid), '-o', 'user=,comm=,args=']),
    platform === 'linux'
      ? runCommand('readlink', ['-f', `/proc/${pid}/exe`])
      : Promise.resolve({ stdout: '', stderr: '', exitCode: 0 }),
  ]);
  const fields = ps.stdout.trim().split(/\s+/);
  return {
    user: fields[0] || undefined,
    processName: fields[1] || undefined,
    commandLine: fields.slice(2).join(' ') || undefined,
    executablePath: exe.stdout.trim() || fields[1] || undefined,
  };
}

export function createUnixAdapter(platform: NodeJS.Platform): PlatformAdapter {
  return {
    platform,
    async listListeningProcesses() {
      const all = await discover();
      const enriched = await Promise.all(
        all.map(async (entry) => ({
          ...entry,
          ...(entry.pid ? await details(entry.pid, platform) : {}),
        })),
      );
      return enriched;
    },
    async findProcessesOnPort(port) {
      return (await this.listListeningProcesses()).filter(
        (entry) => entry.port === port,
      );
    },
    async getProcessDetails(pid) {
      return details(pid, platform);
    },
    async terminateProcess(pid, signal) {
      try {
        process.kill(pid, signal);
        if (signal === 'SIGTERM') {
          const deadline = Date.now() + 1000;
          while (Date.now() < deadline) {
            try {
              process.kill(pid, 0);
            } catch (error) {
              if ((error as NodeJS.ErrnoException).code === 'ESRCH')
                return true;
              throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
        return true;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === 'ESRCH') return false;
        throw error;
      }
    },
  };
}
