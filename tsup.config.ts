import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm', 'cjs'],
  loader: {
    '.sql': 'text',
  },
});
