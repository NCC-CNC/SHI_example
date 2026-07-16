/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app deploys to GitHub Pages at https://ncc-cnc.github.io/SHI_example/,
// so assets must be served from that sub-path. For local dev the base is '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/SHI_example/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      // The pure SHI engine is where correctness lives; hold it to a bar.
      include: ['src/engine/**/*.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
}));
