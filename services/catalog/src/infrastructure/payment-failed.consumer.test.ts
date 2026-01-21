import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestHarness } from '@retrovault/shared';
import { PrismaClient } from './generated/client/index.js';

describe('PaymentFailedConsumer Integration Test', () => {
  let kafkaSetup: any;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // 1. Kafka sigue siendo local a este test
    kafkaSetup = await TestHarness.setupKafka();
    process.env.KAFKA_BROKERS = kafkaSetup.bootstrapServers;

    // 2. La DB ya viene configurada del setup global
    prisma = new PrismaClient();
  }, 60000);

  afterAll(async () => {
    if (kafkaSetup?.container) await kafkaSetup.container.stop();
    await prisma.$disconnect();
  });

  it('debería procesar PaymentFailed y devolver el stock al producto', async () => {
    // Imports dinámicos para usar las clases con las ENV ya cargadas
    const { PrismaProductRepository } = await import('./prisma-product.repository.js');
    const { ProductCreatedPublisher } = await import('./product-created.publisher.js');
    const { CompensateStockUseCase } = await import('../application/compensate-stock.usecase.js');
    const { PaymentFailedConsumer } = await import('./payment-failed.consumer.js');
    const { Product } = await import('../domain/product.entity.js');
    const { kafka } = await import('./kafka.client.js');

    const repo = new PrismaProductRepository();
    const publisher = new ProductCreatedPublisher();
    const useCase = new CompensateStockUseCase(repo, publisher);
    const consumer = new PaymentFailedConsumer(kafka, useCase);

    const productId = crypto.randomUUID();
    await repo.save(new Product(productId, 'Sonic', 25, 5, 1991));

    await consumer.run();

    // Act
    const producer = kafkaSetup.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'payment-failed',
      messages: [{
        value: JSON.stringify({
          orderId: crypto.randomUUID(),
          productIds: [productId],
          reason: 'PAYMENT_REJECTED' // <--- ASEGÚRATE DE QUE ESTE CAMPO ESTÉ
        })
      }]
    });

    // Assert
    await new Promise(resolve => setTimeout(resolve, 2000));
    const updated = await repo.findById(productId);
    expect(updated?.stock).toBe(6);

    await producer.disconnect();
  }, 25000);
});