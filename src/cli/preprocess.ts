export function preprocessArgv(argv: string[]): string[] {
  const base = argv.slice(0, 2);
  const rest = argv.slice(2);
  if (rest.length === 0) return argv;

  const first = rest[0];
  if (first !== undefined && /^\d+$/.test(first)) {
    return [...base, 'find', ...rest];
  }

  const portFlag = first === '--port' || first === '-p';
  const equalsMatch = first?.match(/^(?:--port|-p)=(.+)$/);
  if (portFlag && rest[1] !== undefined) {
    return [...base, 'find', rest[1], ...rest.slice(2)];
  }
  if (equalsMatch) {
    return [...base, 'find', equalsMatch[1], ...rest.slice(1)];
  }

  return argv;
}
