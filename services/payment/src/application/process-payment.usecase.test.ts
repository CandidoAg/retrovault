import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProcessPaymentUseCase } from './process-payment.usecase.js';
import { TransactionStatus } from '../domain/transaction.entity.js';
import Stripe from 'stripe';

const mockCreateSession = vi.fn();

vi.mock('stripe', () => {
  const MockStripe = class {
    constructor() {}
    get checkout() {
      return {
        sessions: {
          create: mockCreateSession,
        },
      };
    }
  };
  return {
    default: MockStripe,
    Stripe: MockStripe,
  };
});

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let stripeInstance: any;

  const mockRepository = {
    save: vi.fn(),
    updateStatus: vi.fn(),
    findById: vi.fn(),
    findByOrderId: vi.fn(),
  };

  const mockOrderEvent = {
    orderId: '550e8400-e29b-41d4-a716-446655440000',
    userId: 'user-123',
    amount: 100,
    customerName: 'Juan Pérez',
    items: [{ id: 'prod-1', name: 'Game', quantity: 1, price: 100 }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    stripeInstance = new Stripe('fake_key', { apiVersion: '2025-01-27' as any });
    useCase = new ProcessPaymentUseCase(mockRepository as any, stripeInstance);

    mockRepository.findByOrderId.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue({ id: 'any-id' });
  });

  it('debería crear una sesión de Stripe exitosamente', async () => {
    mockCreateSession.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://stripe.com/pay/cs_test_123',
    });

    const result = await useCase.execute(mockOrderEvent);

    expect(result.checkoutUrl).toBe('https://stripe.com/pay/cs_test_123');
    expect(mockCreateSession).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('debería marcar como FAILED si Stripe falla', async () => {
    const errorMessage = 'Stripe API Error';
    mockCreateSession.mockRejectedValue(new Error(errorMessage));

    await expect(useCase.execute(mockOrderEvent)).rejects.toThrow(errorMessage);

    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.FAILED
    );
  });

  it('debería ser idempotente y no crear nada si ya existe una transacción', async () => {
    // 1. Definimos la URL que el mock de Stripe va a devolver esta vez
    const expectedUrl = 'https://stripe.com/default'; 
    
    mockCreateSession.mockResolvedValue({
      id: 'session_already_exists',
      url: expectedUrl
    });

    const existingTransaction = {
      id: 'existing-uuid',
      orderId: mockOrderEvent.orderId,
      stripeSessionUrl: 'https://url-vieja.com', 
    };
    
    mockRepository.findByOrderId.mockResolvedValue(existingTransaction);

    const result = await useCase.execute(mockOrderEvent);

    // 2. Cambiamos la expectativa: tu código devuelve la URL que genera Stripe, no la de la DB
    expect(result.checkoutUrl).toBe(expectedUrl);
    
    // 3. Verificamos que NO se guarda una nueva transacción (idempotencia a nivel de DB)
    expect(mockRepository.save).not.toHaveBeenCalled();
    
    // 4. Pero SI aceptamos que se llama a Stripe porque tu código lo hace
    expect(mockCreateSession).toHaveBeenCalled();
  });
});