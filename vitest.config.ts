// vitest.config.ts (en el root)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Nos permite usar 'describe', 'it', 'expect' sin importarlos en cada archivo
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 90,
        branches: 90,
        statements: 90
      }
    },
    passWithNoTests: true,
  },
});