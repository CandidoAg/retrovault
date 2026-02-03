import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import fastifyProxy from '@fastify/http-proxy';
import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

const rewriteWithAuth = (request: any, headers: any) => {
  const authHeader = headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro') as any;
      
      return {
        ...headers,
        'x-user-id': decoded.userId,
        'x-user-name': decoded.name,
      };
    } catch (e) {
      // Token inválido
    }
  }
  return headers;
};

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });
  const fastifyInstance = adapter.getInstance();

  // 1. TÚNEL PARA STRIPE (Tipado para evitar error 7006)
  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3003',
    prefix: '/webhooks/stripe',
    rewritePrefix: '/webhooks/stripe',
    http2: false,
    preHandler: (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
      done();
    },
  });

  // 2. RESTO DE PROXIES
  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3002',
    prefix: '/orders',
    rewritePrefix: '/orders',
    replyOptions: { rewriteRequestHeaders: rewriteWithAuth },
  });

  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3003',
    prefix: '/payments',
    rewritePrefix: '/payments',
    replyOptions: { rewriteRequestHeaders: rewriteWithAuth },
  });

  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3004',
    prefix: '/auth',
    rewritePrefix: '/auth',
  });

  await fastifyInstance.register(fastifyProxy as any, {
    upstream: 'http://127.0.0.1:3005',
    prefix: '/catalog',
    rewritePrefix: '/catalog',
    replyOptions: { rewriteRequestHeaders: rewriteWithAuth },
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  await app.listen(3000, '0.0.0.0');
  
  console.log('🌐 Gateway Tunelizado y Tipado en: http://localhost:3000');
}

bootstrap();