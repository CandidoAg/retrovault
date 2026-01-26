import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthModule } from './auth.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AuthModule,
    new FastifyAdapter()
  );

  const port = process.env.AUTH_PORT || 3004;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Auth Service running on: http://localhost:${port}`);
}

bootstrap();