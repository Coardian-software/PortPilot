import type { PlatformAdapter } from './types';
import { PlatformCapabilityError } from './types';
import { createUnixAdapter } from './unix';
import { createWindowsAdapter } from './windows';

export { PlatformAdapter, PlatformCapabilityError } from './types';

export function getPlatformAdapter(): PlatformAdapter {
  if (process.platform === 'win32') return createWindowsAdapter();
  if (process.platform === 'linux' || process.platform === 'darwin') {
    return createUnixAdapter(process.platform);
  }
  throw new PlatformCapabilityError(
    `Process discovery is not supported on ${process.platform}.`,
  );
}
