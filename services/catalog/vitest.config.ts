import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclusión de archivos para la ejecución de tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/src/infrastructure/generated/**', 
      '**/src/main.ts',
      '**/src/test-*.ts',
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
        'src/test-*.ts',
        '**/*.test.ts',
        '**/*.d.ts',
        'src/infrastructure/generated/**', // Evita que v8 intente leer el cliente generado
        'src/domain/*.events.ts',
        'src/domain/*.repository.ts',
        '**/*.module.ts',
        '**/*.controller.ts'
      ]
    },
    testTimeout: 60000, 
    hookTimeout: 60000,
  },
});