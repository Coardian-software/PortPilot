import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let cachedVersion: string | undefined;

export function getVersion(): string {
  if (cachedVersion) return cachedVersion;
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(here, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  cachedVersion = pkg.version;
  return cachedVersion;
}
