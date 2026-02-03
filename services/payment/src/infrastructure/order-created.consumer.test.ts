import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderCreatedConsumer } from './order-created.consumer.js';
import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';

// Definimos los mocks de las funciones para poder espiarlos fácilmente
const mockConsumer = {
  connect: vi.fn(),
  subscribe: vi.fn(),
  run: vi.fn(),
};

const mockAdmin = {
  connect: vi.fn(),
  createTopics: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('./kafka.client.js', () => ({
  kafka: {
    consumer: vi.fn(() => mockConsumer),
    admin: vi.fn(() => mockAdmin),
  },
}));

describe('OrderCreatedConsumer', () => {
  let consumer: OrderCreatedConsumer;
  let mockUseCase: any;
  let mockOnProcessed: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCase = { execute: vi.fn() };
    mockOnProcessed = vi.fn();
    consumer = new OrderCreatedConsumer(mockUseCase, mockOnProcessed);
  });

  it('debería procesar un mensaje de Kafka, ejecutar el use case y llamar al callback', async () => {
      const validOrderId = "550e8400-e29b-41d4-a716-446655440000";
      const validProductId = "550e8400-e29b-41d4-a716-446655440001";
      const validCustomerId = "550e8400-e29b-41d4-a716-446655440002";

      const mockTransaction = new Transaction('tx-1', validOrderId, 100, TransactionStatus.COMPLETED, new Date());
      mockUseCase.execute.mockResolvedValue({ 
        transaction: mockTransaction, 
        checkoutUrl: 'http://stripe-url.com' 
      });
      
      const kafkaMessage = {
        value: Buffer.from(JSON.stringify({
          orderId: validOrderId,
          total: 100,
          paymentMethodId: 'pm_123',
          customerId: validCustomerId,
          customerName: 'John Doe',
          occurredAt: new Date().toISOString(),
          items: [{ 
            id: validProductId, 
            quantity: 1,
            name: "Producto de prueba", // Campo faltante
            price: 100                  // Campo faltante
          }],
        }))
      };

      await consumer.run();
      
      const eachMessageHandler = mockConsumer.run.mock.calls[0][0].eachMessage;
      await eachMessageHandler({ message: kafkaMessage });

      // Ahora sí debería pasar la validación y llamar al Use Case
      expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ 
        orderId: validOrderId,
        amount: 100 
      }));
      expect(mockOnProcessed).toHaveBeenCalledWith(mockTransaction, [validProductId]);
  });
});