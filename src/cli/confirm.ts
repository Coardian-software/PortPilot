import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function confirm(message: string): Promise<boolean> {
  if (!input.isTTY || !output.isTTY) return false;
  const rl = createInterface({
    input: input as unknown as NodeJS.ReadableStream,
    output: output as unknown as NodeJS.WritableStream,
  });
  try {
    const answer = await rl.question(`${message} [y/N] `);
    return /^(y|yes)$/i.test(answer.trim());
  } finally {
    rl.close();
  }
}
