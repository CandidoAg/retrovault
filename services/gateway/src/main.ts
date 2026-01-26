import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import fastifyProxy from '@fastify/http-proxy';

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });
  const fastifyInstance = adapter.getInstance();

  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3002',
    prefix: '/orders',
    rewritePrefix: '/orders',
    http2: false,
  });

  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3004',
    prefix: '/auth',
    rewritePrefix: '/auth',
    http2: false,
  });

  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3005',
    prefix: '/catalog',
    rewritePrefix: '/catalog',
    http2: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  await app.listen(3000, '0.0.0.0');
  
  console.log('🌐 API Gateway running on: http://localhost:3000');
  console.log('🔗 Proxy Ready: /auth -> http://localhost:3004');
}

bootstrap();