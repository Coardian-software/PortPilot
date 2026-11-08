import type { PortProcess } from '../../platform/types';
import { formatAddress } from '../../core/processes';

export type OutputFormat = 'table' | 'json' | 'quiet';

export interface OutputOptions {
  json?: boolean;
  quiet?: boolean;
}

export function resolveFormat(options: OutputOptions): OutputFormat {
  if (options.json) return 'json';
  if (options.quiet) return 'quiet';
  return 'table';
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

const MAX_FIELD_WIDTH = 48;

function truncate(text: string): string {
  return text.length > MAX_FIELD_WIDTH
    ? text.slice(0, MAX_FIELD_WIDTH - 1) + '…'
    : text;
}

export interface FindResult {
  port: number;
  processes: PortProcess[];
}

export function formatFindResult(result: FindResult): string {
  if (result.processes.length === 0) {
    return `No process is listening on port ${result.port}.`;
  }
  return `Port ${result.port}\n\n${formatProcessTable(result.processes)}`;
}

export function formatProcessTable(processes: PortProcess[]): string {
  if (processes.length === 0) return '';
  const headers = ['PID', 'PROCESS', 'ADDRESS'];
  const rows: string[][] = processes.map((p) => [
    String(p.pid),
    truncate(p.processName ?? 'unknown'),
    formatAddress(p),
  ]);
  const widths = headers.map((_, col) =>
    Math.max(headers[col].length, ...rows.map((row) => row[col].length)),
  );
  const pad = (cell: string, col: number) => cell.padEnd(widths[col]);
  const render = (cells: string[]) => cells.map((c, i) => pad(c, i)).join('  ');
  const divider = widths.map((w) => '─'.repeat(w)).join('  ');
  const body = rows.map(render);
  return [render(headers), divider, ...body].join('\n');
}

export interface ListResult {
  processes: PortProcess[];
}

export function formatListTable(result: ListResult): string {
  if (result.processes.length === 0) {
    return 'No listening ports found.';
  }
  const headers = ['PORT', 'PID', 'PROCESS', 'ADDRESS'];
  const rows: string[][] = result.processes.map((p) => [
    String(p.port),
    String(p.pid),
    truncate(p.processName ?? 'unknown'),
    formatAddress(p),
  ]);
  const widths = headers.map((_, col) =>
    Math.max(headers[col].length, ...rows.map((row) => row[col].length)),
  );
  const pad = (cell: string, col: number) => cell.padEnd(widths[col]);
  const render = (cells: string[]) => cells.map((c, i) => pad(c, i)).join('  ');
  const divider = widths.map((w) => '─'.repeat(w)).join('  ');
  const body = rows.map(render);
  return [render(headers), divider, ...body].join('\n');
}

export function formatQuietPids(processes: PortProcess[]): string {
  return processes.map((p) => String(p.pid)).join('\n');
}

export interface InspectResult {
  process: PortProcess;
  commandLine?: string;
  executablePath?: string;
  user?: string;
  os: string;
}

export function formatInspectResult(result: InspectResult): string {
  const entries: Array<[string, string | number | undefined]> = [
    ['Port', result.process.port],
    ['Protocol', result.process.protocol.toUpperCase()],
    ['PID', result.process.pid],
    ['Process', result.process.processName ?? 'unknown'],
    ['Address', formatAddress(result.process)],
  ];
  if (result.commandLine && result.commandLine !== '') {
    entries.push(['Command', result.commandLine]);
  } else if (result.executablePath && result.executablePath !== '') {
    entries.push(['Executable', result.executablePath]);
  }
  if (result.user && result.user !== '') {
    entries.push(['User', result.user]);
  }
  entries.push(['OS', result.os]);
  const maxLabel = Math.max(...entries.map(([label]) => label.length));
  const gap = maxLabel + 2;
  const pad = (label: string) =>
    `${label}:${' '.repeat(Math.max(1, gap - label.length - 1))}`;
  return entries
    .filter(([, val]) => val !== undefined && val !== '')
    .map(([label, val]) => `${pad(label)}${val}`)
    .join('\n');
}

export function formatProcessListBrief(processes: PortProcess[]): string {
  const header = 'Port is being used by:';
  const body = processes
    .map((p) => `PID: ${p.pid}\nProcess: ${p.processName ?? 'unknown'}`)
    .join('\n\n');
  return `${header}\n\n${body}`;
}
