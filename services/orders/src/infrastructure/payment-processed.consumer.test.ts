import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentProcessedConsumer } from './payment-processed.consumer.js';
import { OrderStatus } from '@retrovault/shared';

describe('PaymentProcessedConsumer', () => {
  let consumer: PaymentProcessedConsumer;
  let mockUpdateStatusUseCase: any;
  let mockKafka: any;

  const validOrderId = '550e8400-e29b-41d4-a716-446655440000';
  const validTransactionId = 'txn_123456';

  beforeEach(() => {
    mockUpdateStatusUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

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

    consumer = new PaymentProcessedConsumer(mockKafka as any, mockUpdateStatusUseCase);
  });

  it('debería procesar payment-completed y actualizar a PAID', async () => {
    await consumer.run();
    const { eachMessage } = mockKafka.consumer().run.mock.calls[0][0];

    const payload = {
      orderId: validOrderId,
      transactionId: validTransactionId,
      amount: 1000,
      occurredAt: new Date().toISOString(),
    };

    await eachMessage({
      topic: 'payment-completed',
      message: { value: Buffer.from(JSON.stringify(payload)) },
    });

    expect(mockUpdateStatusUseCase.execute).toHaveBeenCalledWith({
      orderId: validOrderId,
      status: 'PAID',
    });
  });

  it('debería procesar payment-failed y actualizar a CANCELLED', async () => {
    await consumer.run();
    const { eachMessage } = mockKafka.consumer().run.mock.calls[0][0];

    const payload = {
      orderId: validOrderId,
      transactionId: validTransactionId,
      amount: 1000,
      reason: 'Insufficient funds',
      productNames: 'prod-1, prod-2',
      occurredAt: new Date().toISOString(),
    };

    await eachMessage({
      topic: 'payment-failed',
      message: { value: Buffer.from(JSON.stringify(payload)) },
    });

    expect(mockUpdateStatusUseCase.execute).toHaveBeenCalledWith({
      orderId: validOrderId,
      status: 'CANCELLED',
    });
  });

  it('debería manejar errores de validación (Zod) sin romper el proceso', async () => {
    await consumer.run();
    const { eachMessage } = mockKafka.consumer().run.mock.calls[0][0];

    const invalidPayload = { foo: 'bar' };

    await expect(
      eachMessage({
        topic: 'payment-completed',
        message: { value: Buffer.from(JSON.stringify(invalidPayload)) },
      })
    ).resolves.not.toThrow(); 

    expect(mockUpdateStatusUseCase.execute).not.toHaveBeenCalled();
  });
});