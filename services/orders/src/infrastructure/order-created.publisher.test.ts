import { describe, it, expect, vi } from 'vitest';

vi.mock('./kafka.client.js', () => ({
  kafka: {
    producer: vi.fn().mockReturnValue({
      connect: vi.fn(),
      send: vi.fn().mockResolvedValue([]),
      disconnect: vi.fn(),
    }),
  },
}));

import { OrderCreatedPublisher } from './order-created.publisher.js';
import { kafka } from './kafka.client.js';

describe('OrderCreatedPublisher', () => {
  it('should send an order created event to kafka', async () => {
    const publisher = new OrderCreatedPublisher();
  
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    
    const event = { 
        orderId: validId, 
        customerId: validId, 
        paymentMethodId: 'pm_visa_123',
        items: [], 
        total: 100, 
        createdAt: new Date() 
    };

    await publisher.publish(event);

    const mockProducer = kafka.producer();
    
    expect(mockProducer.send).toHaveBeenCalledWith(expect.objectContaining({
        topic: 'order-events',
        messages: expect.arrayContaining([
          expect.objectContaining({
            value: expect.any(String) // El JSON stringificado
          })
        ])
    }));
  });
});