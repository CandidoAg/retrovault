// services/payment/src/main.ts
import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module.js';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    PaymentModule,
    new FastifyAdapter()
  );
  
  const consumer = app.get(OrderCreatedConsumer);
  
  console.log('🚀 [Payment Service] Starting Kafka Consumer...');
  await consumer.run();

  await app.listen(process.env.PORT ?? 3003);
  console.log(`💳 Payment Service is running on port ${process.env.PORT ?? 3003}`);
}
bootstrap();