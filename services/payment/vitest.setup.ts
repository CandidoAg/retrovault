// services/catalog/vitest.setup.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  // Solo se levanta una vez para todos los tests de este microservicio
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('payment_db')
    .start();

  const dbUrl = container.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;

  // Sincronizamos Prisma con el contenedor recién creado
  execSync('pnpm exec prisma db push', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit'
  });
}, 60000);

afterAll(async () => {
  if (container) await container.stop();
});