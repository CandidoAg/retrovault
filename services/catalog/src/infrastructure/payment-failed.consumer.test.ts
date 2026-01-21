import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestHarness } from '@retrovault/shared';
import { PrismaClient } from './generated/client/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('PaymentFailedConsumer Integration Test', () => {
  let kafkaSetup: any;
  let postgresSetup: any;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // 1. Iniciamos Kafka
    kafkaSetup = await TestHarness.setupKafka();
    
    // 2. Preparamos variables de entorno para Catalog
    TestHarness.fillEmptyEnv('catalog');

    // 3. Iniciamos Postgres con el Harness
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const { PrismaProductRepository } = await import('./prisma-product.repository.js');

    postgresSetup = await TestHarness.setupPrisma({
      databaseName: process.env.DATABASE_NAME || 'catalog_db', 
      databaseUser: process.env.DATABASE_USER || 'test_user',
      databasePassword: process.env.DATABASE_PASSWORD || 'test_password' ,
      schemaPath,
      PrismaClient,
      PrismaRepository: PrismaProductRepository
    });

    prisma = postgresSetup.prisma;

    // 4. Sincronizamos los brokers de Kafka dinámicos
    process.env.KAFKA_BROKERS = kafkaSetup.bootstrapServers;
  }, 60000);

  afterAll(async () => {
    if (postgresSetup?.container) await postgresSetup.container.stop();
    if (kafkaSetup?.container) await kafkaSetup.container.stop();
  });

  it('debería procesar PaymentFailed y devolver el stock al producto (Compensación)', async () => {
    // --- ARRANGE ---
    // Imports dinámicos para evitar que carguen variables de entorno antes de tiempo
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

    // Creamos un producto con stock bajo (simulando que ya se descontó antes)
    const productId = crypto.randomUUID();
    const initialProduct = new Product(productId, 'Sonic the Hedgehog', 25, 5, 1991);
    await repo.save(initialProduct);

    // Arrancamos el consumidor
    await consumer.run();

    // --- ACT ---
    // Simulamos que el microservicio de Payment publica un fallo
    const producer = kafkaSetup.kafka.producer();
    await producer.connect();

    const validOrderId = crypto.randomUUID();
    await producer.send({
      topic: 'payment-failed',
      messages: [{
        value: JSON.stringify({
          orderId: validOrderId,
          reason: 'INSUFFICIENT_FUNDS', // Campo típico en fallos de pago
          productIds: [productId]
        })
      }]
    });

    // --- ASSERT ---
    // Damos un margen para el procesamiento asíncrono
    await new Promise(resolve => setTimeout(resolve, 4000));

    const updatedProduct = await repo.findById(productId);
    
    // El stock original era 5, sumamos 1 de la compensación = 6
    expect(updatedProduct?.stock).toBe(6);
    
    await producer.disconnect();
  }, 25000);
});