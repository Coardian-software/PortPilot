export const PORT_MIN = 1;
export const PORT_MAX = 65535;

export class PortValidationError extends Error {
  public readonly input: string;
  constructor(input: string | number) {
    const raw = String(input);
    super(
      `Invalid port: ${raw}\nPort must be between ${PORT_MIN} and ${PORT_MAX}.`,
    );
    this.name = 'PortValidationError';
    this.input = raw;
  }
}

export type PortInput = string | number;

export function parsePort(input: PortInput): number {
  const isValidString = typeof input === 'string' && /^\d+$/.test(input);
  const isValidNumber =
    typeof input === 'number' && Number.isSafeInteger(input);
  const value = typeof input === 'string' ? Number(input) : input;
  if (
    (!isValidString && !isValidNumber) ||
    !Number.isSafeInteger(value) ||
    value < PORT_MIN ||
    value > PORT_MAX
  ) {
    throw new PortValidationError(input);
  }
  return value;
}

export function isValidPort(input: unknown): boolean {
  try {
    parsePort(input as PortInput);
    return true;
  } catch {
    return false;
  }
}
