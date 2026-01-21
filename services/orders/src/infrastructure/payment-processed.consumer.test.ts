import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentProcessedConsumer } from './payment-processed.consumer.js';

describe('PaymentProcessedConsumer', () => {
  let mockKafka: any;
  let mockUpdateStatusUseCase: any;
  let consumerInstance: PaymentProcessedConsumer;

  // Un UUID válido para pasar las validaciones de Zod
  const validOrderId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    mockKafka = {
      consumer: vi.fn().mockReturnValue({
        connect: vi.fn(),
        subscribe: vi.fn(),
        run: vi.fn(),
      }),
      admin: vi.fn().mockReturnValue({
        connect: vi.fn(),
        createTopics: vi.fn(),
        disconnect: vi.fn(),
      }),
    };

    mockUpdateStatusUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    consumerInstance = new PaymentProcessedConsumer(
      mockKafka as any,
      mockUpdateStatusUseCase as any
    );
  });

  it('debería procesar payment-completed y actualizar a PAID', async () => {
    await consumerInstance.run();
    const eachMessage = mockKafka.consumer().run.mock.calls[0][0].eachMessage;

    const mockMessage = {
      topic: 'payment-completed',
      message: {
        value: Buffer.from(JSON.stringify({
          orderId: validOrderId,
          transactionId: 'tx-123',
          amount: 100,
          occurredAt: new Date().toISOString()
        }))
      }
    };

    await eachMessage(mockMessage);

    expect(mockUpdateStatusUseCase.execute).toHaveBeenCalledWith({
      orderId: validOrderId,
      status: 'PAID'
    });
  });

  it('debería procesar payment-failed y actualizar a CANCELLED', async () => {
    await consumerInstance.run();
    const eachMessage = mockKafka.consumer().run.mock.calls[0][0].eachMessage;

    const mockMessage = {
      topic: 'payment-failed',
      message: {
        value: Buffer.from(JSON.stringify({
          orderId: validOrderId,
          reason: 'Insufficient funds',
          productIds: [validOrderId], 
          occurredAt: new Date().toISOString() 
        }))
      }
    };

    await eachMessage(mockMessage);

    expect(mockUpdateStatusUseCase.execute).toHaveBeenCalledWith({
      orderId: validOrderId,
      status: 'CANCELLED'
    });
  });

  it('debería manejar errores de validación (Zod) sin romper el proceso', async () => {
    await consumerInstance.run();
    const eachMessage = mockKafka.consumer().run.mock.calls[0][0].eachMessage;

    const invalidMessage = {
      topic: 'payment-completed',
      message: {
        value: Buffer.from(JSON.stringify({ orderId: 'no-es-uuid' }))
      }
    };

    await expect(eachMessage(invalidMessage)).resolves.not.toThrow();
    expect(mockUpdateStatusUseCase.execute).not.toHaveBeenCalled();
  });
});