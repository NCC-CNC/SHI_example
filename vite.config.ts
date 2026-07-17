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
    setupFiles: ['./src/test-setup.ts'],
    // The tour and share interaction tests render the full ~30x30 app (4500 SVG
    // cells) and click through many re-renders, which is legitimately slow in
    // CI. Raise the per-test ceiling above the 5s default so they are not flaky.
    testTimeout: 20000,
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
