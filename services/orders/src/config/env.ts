import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3002').transform(Number),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  CATALOG_DB_PORT: z.string().default('5433').transform(Number),
  CATALOG_DB_IP: z.string().default('localhost'),
  DATABASE_URL: z.string().min(1)
});

export const env = envSchema.parse(process.env);