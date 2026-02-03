// services/payment/src/main.ts
import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module.js';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
const app = await NestFactory.create<NestFastifyApplication>(
    PaymentModule,
    new FastifyAdapter(),
    { rawBody: true }
  );
  
  app.enableCors({
    origin: "http://localhost:3001",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });

  // 1. Levantamos el servidor (Esto libera el puerto 3003)
  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');
  console.log(`💳 Payment Service is running`);

  // 2. Arrancamos Kafka DESPUÉS y sin bloquear con await
  const consumer = app.get(OrderCreatedConsumer);
  consumer.run().catch(err => console.error("Kafka Error", err));
}
bootstrap();