import { runCommand } from './command';
import type { PlatformAdapter, PortProcess } from './types';

export function parseNetstat(output: string): PortProcess[] {
  const result: PortProcess[] = [];
  for (const line of output.split('\n')) {
    const fields = line.trim().split(/\s+/);
    if (fields.length < 5 || fields[0].toUpperCase() !== 'TCP') continue;
    if (fields[3].toUpperCase() !== 'LISTENING') continue;
    const endpoint = fields[1];
    const separator = endpoint.lastIndexOf(':');
    const port = Number(endpoint.slice(separator + 1));
    if (separator < 1 || !Number.isInteger(port)) continue;
    result.push({
      address: endpoint.slice(0, separator),
      port,
      pid: Number(fields[4]),
      protocol: 'tcp',
    });
  }
  return result.filter((entry) => entry.pid > 0);
}

export function createWindowsAdapter(): PlatformAdapter {
  return {
    platform: 'win32',
    async listListeningProcesses() {
      const result = await runCommand('netstat', ['-ano', '-p', 'tcp']);
      const processes = parseNetstat(result.stdout);
      return Promise.all(
        processes.map(async (entry) => ({
          ...entry,
          ...(await this.getProcessDetails(entry.pid)),
        })),
      );
    },
    async findProcessesOnPort(port) {
      return (await this.listListeningProcesses()).filter(
        (entry) => entry.port === port,
      );
    },
    async getProcessDetails(pid) {
      const result = await runCommand('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `$p=Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}'; if ($p) { $p | Select-Object Name,ExecutablePath,CommandLine | ConvertTo-Json -Compress }`,
      ]);
      if (result.exitCode !== 0 || result.stdout.trim() === '') return {};
      const value = JSON.parse(result.stdout.trim()) as {
        Name?: string;
        ExecutablePath?: string;
        CommandLine?: string;
      };
      return {
        processName: value.Name,
        executablePath: value.ExecutablePath,
        commandLine: value.CommandLine,
      };
    },
    async terminateProcess(pid, signal) {
      const result = await runCommand('taskkill', [
        signal === 'SIGKILL' ? '/F' : '/T',
        '/PID',
        String(pid),
      ]);
      return result.exitCode === 0;
    },
  };
}
