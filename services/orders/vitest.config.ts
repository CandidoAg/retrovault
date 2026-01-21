// services/catalog/vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'orders-service', // Nombre que aparecerá en la consola
    environment: 'node',
    // Aquí es donde vinculamos el setup del Testcontainer específico de este servicio
    setupFiles: [path.resolve(__dirname, './vitest.setup.ts')],
    globals: true,
    passWithNoTests: true,
  },
});