import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Kafka } from 'kafkajs';
import { PaymentFailedConsumer } from './payment-failed.consumer.js';
import { CompensateStockUseCase } from '../application/compensate-stock.usecase.js';
import { Product } from '../domain/product.entity.js';

describe('PaymentFailedConsumer Integration Test', () => {
  let consumer: PaymentFailedConsumer;
  let mockCompensateUseCase: any;
  let kafka: Kafka;
  let producer: any;

  // Mockeamos el repositorio para no depender de la DB en el unitario
  // O puedes usar el repositorio real si prefieres integración pura
  const mockRepo = {
    findByName: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    kafka = new Kafka({
      brokers: ['localhost:9092'], // Ajusta según tu entorno de test
      retry: { retries: 0 }
    });

    producer = kafka.producer();
    await producer.connect();

    mockCompensateUseCase = new CompensateStockUseCase(mockRepo as any, { publish: vi.fn() } as any);
    
    // Inyectamos el caso de uso real (o mockeado) en el consumidor
    consumer = new PaymentFailedConsumer(kafka, mockCompensateUseCase);
  });

  it('debería procesar PaymentFailed y llamar a la compensación con los items correctos', async () => {
    // 1. Preparamos un producto "existente" en el mock
    const productName = 'Zelda Ocarina';
    const initialProduct = new Product('uuid-1', productName, 50, 5, 1998, 'Nintendo');
    mockRepo.findByName.mockResolvedValue(initialProduct);

    // 2. Ejecutamos el consumidor (en modo escucha)
    // Nota: En tests, a veces es mejor llamar directamente a eachMessage si no quieres lidiar con Kafka real
    await consumer.run();

    // 3. Simulamos el payload que lanza Orders cuando falla el pago
    // IMPORTANTE: productNames debe ser un JSON stringificado según tu código
    const productSummary = { [productName]: 1 }; 
    
    const payload = {
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      transactionId: 'txn_123',
      amount: 50,
      reason: 'Insufficient funds',
      productNames: JSON.stringify(productSummary), // <--- El fix: JSON string
      occurredAt: new Date().toISOString()
    };

    // 4. Enviamos el mensaje al tópico
    await producer.send({
      topic: 'payment-failed',
      messages: [{ value: JSON.stringify(payload) }]
    });

    // 5. Esperamos un poco a que Kafka procese
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 6. Verificaciones
    expect(mockRepo.findByName).toHaveBeenCalledWith(productName);
    // El stock debería haber subido de 5 a 6
    expect(initialProduct.stock).toBe(6);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('debería manejar errores de parseo de JSON en productNames sin explotar', async () => {
    await consumer.run();

    const payload = {
      orderId: 'order-123',
      transactionId: 'txn-123',
      amount: 10,
      reason: 'Error',
      productNames: 'esto-no-es-un-json', // Causará error en JSON.parse
      occurredAt: new Date().toISOString()
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await producer.send({
      topic: 'payment-failed',
      messages: [{ value: JSON.stringify(payload) }]
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Catalog] ❌ Error processing compensation'),
      expect.any(Error)
    );
  });
});