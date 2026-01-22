import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentProcessedPublisher } from './payment-processed.publisher.js';
import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';

vi.mock('./kafka.client.js', () => ({
  kafka: {
    producer: vi.fn(() => ({
      connect: vi.fn(),
      send: vi.fn(),
      disconnect: vi.fn(),
    })),
  },
}));

describe('PaymentProcessedPublisher', () => {
  let publisher: PaymentProcessedPublisher;
  let mockProducer: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    publisher = new PaymentProcessedPublisher();
    const { kafka } = await import('./kafka.client.js');
    mockProducer = (kafka.producer as any).mock.results[0].value;
  });

  it('debería publicar en "payment-completed" cuando la transacción es exitosa', async () => {
    const tx = new Transaction('tx-ok', 'order-ok', 50, TransactionStatus.COMPLETED, new Date());
    const items = ['p1', 'p2'];

    await publisher.publish(tx, items);

    expect(mockProducer.send).toHaveBeenCalledWith(expect.objectContaining({
      topic: 'payment-completed',
      messages: [expect.objectContaining({
        value: expect.stringContaining('"status":"COMPLETED"')
      })]
    }));
  });

  it('debería publicar en "payment-failed" cuando la transacción falla', async () => {
    // UUIDs válidos para que el Schema de shared no falle
    const validTxId = "123e4567-e89b-12d3-a456-426614174000";
    const validOrderId = "123e4567-e89b-12d3-a456-426614174001";
    const validProductId = "123e4567-e89b-12d3-a456-426614174002";

    const tx = new Transaction(validTxId, validOrderId, 50, TransactionStatus.FAILED, new Date());
    const items = [validProductId];

    await publisher.publish(tx, items);

    const { kafka } = await import('./kafka.client.js');
    const mockProducer = (kafka.producer as any).mock.results[0].value;

    expect(mockProducer.send).toHaveBeenCalledWith(expect.objectContaining({
      topic: 'payment-failed'
    }));
  });
});