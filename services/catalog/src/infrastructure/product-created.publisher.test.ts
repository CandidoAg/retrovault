import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Product } from '../domain/product.entity.js';
import { TestHarness } from '@retrovault/shared';
import { EachMessagePayload } from 'kafkajs';

describe('ProductCreatedPublisher con TestHarness', () => {
  let kafkaContainer: any;
  let publisher: any;
  let kafkaInstance: any;

beforeAll(async () => {
    const setup = await TestHarness.setupKafka();
    kafkaContainer = setup.container;
    kafkaInstance = setup.kafka;

    const { ProductCreatedPublisher } = await import('./product-created.publisher.js');
    publisher = new ProductCreatedPublisher();

    const producer = kafkaInstance.producer();
    await producer.connect();
    (publisher as any).producer = producer;

    console.log(`🚀 [Test] Kafka cliente sincronizado en ${setup.bootstrapServers}`);
  }, 60000);

  afterAll(async () => {
    if (kafkaContainer) {
      await kafkaContainer.stop();
    }
  });

  it('debería enviar correctamente un evento de producto creado', async () => {
    const product = new Product(crypto.randomUUID(), 'Zelda Ocarina', 80, 15, 1998);

    // Usamos la instancia importada dinámicamente
    const consumer = kafkaInstance.consumer({ groupId: 'test-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'product-created', fromBeginning: true });

    const messagePromise = new Promise<string>((resolve) => {
      consumer.run({
        eachMessage: async ({ message }: EachMessagePayload) => {
          resolve(message.value?.toString() || '');
        }
      });
    });

    await publisher.publish(product);

    const rawMessage = await messagePromise;
    const payload = JSON.parse(rawMessage);

    expect(payload.name).toBe('Zelda Ocarina');

    await consumer.disconnect();
  });
});