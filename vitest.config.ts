import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
  },
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
