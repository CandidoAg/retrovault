import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/src/infrastructure/generated/**', 
      '**/src/main.ts',
    ],
    globals: true,
    environment: 'node',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        'src/main.ts',
        '**/*.test.ts',
        'src/infrastructure/generated/**',
        'src/config/*.ts',
        'src/infrastructure/kafka.client.ts',
        'test-*.ts'
      ]
    },
    testTimeout: 90000, // Un poco más por Kafka + Postgres
    hookTimeout: 90000,
  },
});