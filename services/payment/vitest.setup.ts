import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';
import { TestHarness } from '@retrovault/shared';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  TestHarness.fillEmptyEnv('payment');
  
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('payment_db')
    .start();

  const dbUrl = container.getConnectionUri();
  
  process.env.DATABASE_URL = dbUrl;

  execSync('pnpm exec prisma db push', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit'
  });

  console.log('✅ [Setup Global] Postgres listo y Prisma sincronizado');
}, 60000);

afterAll(async () => {
  if (container) {
    await container.stop();
    console.log('🛑 [Setup Global] Contenedor Postgres detenido');
  }
});