import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Kafka } from 'kafkajs';
import { ProductCreatedConsumer } from './product-created.consumer.js';
import { ProductRepository } from '../domain/product.repository.js';
import { CatalogProduct } from '../domain/catalog-product.entity.js';

describe('ProductCreatedConsumer', () => {
  let consumer: ProductCreatedConsumer;
  let mockKafka: Kafka;
  let mockConsumer: any;
  let mockRepo: ProductRepository;

  beforeEach(() => {
    // 1. Mock del Consumer de Kafka
    mockConsumer = {
      connect: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(undefined),
      run: vi.fn().mockImplementation(async ({ eachMessage }) => {
        // Guardamos el callback para dispararlo manualmente en los tests
        mockConsumer._triggerMessage = eachMessage;
      }),
    };

    // 2. Mock de la instancia de Kafka
    mockKafka = {
      consumer: vi.fn().mockReturnValue(mockConsumer),
    } as unknown as Kafka;

    // 3. Mock del Repositorio
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
    } as unknown as ProductRepository;

    consumer = new ProductCreatedConsumer(mockKafka, mockRepo);
  });

  it('debe conectar y suscribirse al tópico correcto', async () => {
    await consumer.run();

    expect(mockConsumer.connect).toHaveBeenCalled();
    expect(mockConsumer.subscribe).toHaveBeenCalledWith({
      topics: ['product-created'],
      fromBeginning: true,
    });
    expect(mockConsumer.run).toHaveBeenCalled();
  });

  it('debe procesar un mensaje y guardar el producto en el repositorio', async () => {
    await consumer.run();

    const mockPayload = {
      id: 'prod-123',
      name: 'Laptop Gaming',
      price: 1200,
      stock: 10
    };

    const kafkaMessage = {
      message: {
        value: Buffer.from(JSON.stringify(mockPayload)),
      },
    };

    // Simulamos que Kafka recibe un mensaje
    await mockConsumer._triggerMessage(kafkaMessage);

    // Verificamos que se llamó al repositorio con una instancia de CatalogProduct
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.any(CatalogProduct)
    );

    // Verificamos que los datos pasados al constructor de CatalogProduct sean correctos
    const savedProduct = (mockRepo.save as any).mock.calls[0][0];
    expect(savedProduct.id).toBe(mockPayload.id);
    expect(savedProduct.name).toBe(mockPayload.name);
    expect(savedProduct.stock).toBe(mockPayload.stock);
  });

  it('no debe hacer nada si el mensaje es nulo', async () => {
    await consumer.run();

    const kafkaMessage = {
      message: { value: null },
    };

    await mockConsumer._triggerMessage(kafkaMessage);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('debe capturar errores si el JSON está mal formado', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await consumer.run();

    const kafkaMessage = {
      message: {
        value: Buffer.from('invalid-json'),
      },
    };

    await mockConsumer._triggerMessage(kafkaMessage);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error procesando mensaje'),
      expect.any(Error)
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});