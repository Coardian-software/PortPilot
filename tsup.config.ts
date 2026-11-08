import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli/index.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
  platform: 'node',
  target: 'es2022',
  splitting: false,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
});
