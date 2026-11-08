import type { PortProcess } from '../platform/types';

export function displayName(processEntry: PortProcess): string {
  return processEntry.processName ?? 'unknown';
}

export function formatAddress(processEntry: PortProcess): string {
  const address =
    processEntry.address.includes(':') && !processEntry.address.startsWith('[')
      ? `[${processEntry.address}]`
      : processEntry.address;
  return `${address}:${processEntry.port}`;
}

export function sortByPort(processes: PortProcess[]): PortProcess[] {
  return [...processes].sort((a, b) => a.port - b.port);
}
