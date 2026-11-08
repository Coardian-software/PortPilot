import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    typecheck: { enabled: false },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      exclude: ['node_modules', 'dist'],
    },
  },
});
