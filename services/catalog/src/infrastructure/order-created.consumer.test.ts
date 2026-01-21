import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestHarness } from '@retrovault/shared';
import { PrismaClient } from './generated/client/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaProductRepository } from './prisma-product.repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('OrderCreatedConsumer Integration Test', () => {
  let kafkaSetup: any;
  let postgresSetup: any;
  let prisma: PrismaClient;

  beforeAll(async () => {

    // 1. Iniciamos Kafka primero
    kafkaSetup = await TestHarness.setupKafka();
    
    // 2. Cargamos variables de entorno base
    TestHarness.fillEmptyEnv('catalog');

    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    
    // 3. Ejecutamos setupPrisma pero capturamos la URL exacta
    postgresSetup = await TestHarness.setupPrisma({
      databaseName: process.env.DATABASE_NAME || 'catalog_db', 
      databaseUser: process.env.DATABASE_USER || 'test_user',
      databasePassword: process.env.DATABASE_PASSWORD || 'test_password' ,
      schemaPath,
      PrismaClient,
      PrismaRepository: PrismaProductRepository
    });

    // 💡 ESTA ES LA CLAVE: Forzamos la variable de entorno ANTES de cualquier import dinámico
    process.env.KAFKA_BROKERS = kafkaSetup.bootstrapServers;

    prisma = postgresSetup.prisma;
  }, 60000);

  afterAll(async () => {
    await postgresSetup.container.stop();
    await kafkaSetup.container.stop();
  });

  it('debería procesar un evento de orden creada y descontar stock en la DB real', async () => {
    // --- ARRANGE ---
    const { PrismaProductRepository } = await import('./prisma-product.repository.js');
    const { ProductCreatedPublisher } = await import('./product-created.publisher.js');
    const { DecreaseStockUseCase } = await import('../application/decrease-stock.usecase.js');
    const { OrderCreatedConsumer } = await import('./order-created.consumer.js');
    const { Product } = await import('../domain/product.entity.js');

    const repo = new PrismaProductRepository();
    const publisher = new ProductCreatedPublisher();
    const useCase = new DecreaseStockUseCase(repo, publisher);
    const consumer = new OrderCreatedConsumer(useCase);

    // Creamos un producto inicial en la DB
    const productId = crypto.randomUUID();
    const initialProduct = new Product(productId, 'Chrono Trigger', 100, 10, 1995);
    await repo.save(initialProduct);

    // --- ACT ---
    await consumer.run();

    // Simulamos el envío de un mensaje desde el microservicio de Orders
    const producer = kafkaSetup.kafka.producer();
    await producer.connect();
    const validOrderId = crypto.randomUUID();

    await producer.send({
      topic: 'order-events',
      messages: [{
        value: JSON.stringify({
          orderId: validOrderId,      
          total: 50,                  
          items: [{ 
            id: productId, 
            quantity: 1,
            name: 'Chrono Trigger',   
            price: 50                 
          }]
        })
      }]
    });

    // --- ASSERT ---
    // Esperamos un poco a que el consumer procese el mensaje asíncrono
    await new Promise(resolve => setTimeout(resolve, 3000));

    const updatedProduct = await repo.findById(productId);
    
    expect(updatedProduct?.stock).toBe(9); // 10 - 1 = 9
    
    await producer.disconnect();
  }, 20000);
});