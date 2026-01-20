import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3003').transform(Number),
  KAFKA_BROKERS: z.string().default('localhost:9092'),

  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  PAYMENT_DB_PORT: z.string().default('5435').transform(Number),
  PAYMENT_DB_IP: z.string().default('localhost'),
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1, "La clave secreta de Stripe es obligatoria"),
});

export const env = envSchema.parse(process.env);