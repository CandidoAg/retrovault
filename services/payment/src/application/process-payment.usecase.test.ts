import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessPaymentUseCase } from './process-payment.usecase.js';
import { TransactionStatus } from '../domain/transaction.entity.js';

vi.mock('stripe', () => {
  const mockStripeInstance = {
    paymentIntents: {
      create: vi.fn(),
    },
  };

  function MockStripe() {
    return mockStripeInstance;
  }

  return {
    default: MockStripe,
  };
});

import Stripe from 'stripe';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let mockRepository: any;
  let stripeInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      save: vi.fn(),
      updateStatus: vi.fn(),
      findByOrderId: vi.fn()
    };

    useCase = new ProcessPaymentUseCase(mockRepository);
    
    stripeInstance = new Stripe('fake_key');
  });

  it('debería completar el pago exitosamente cuando Stripe responde "succeeded"', async () => {
    const input = { orderId: 'order-1', amount: 100 };
    
    stripeInstance.paymentIntents.create.mockResolvedValue({
      status: 'succeeded'
    });

    const result = await useCase.execute(input);

    expect(result.status).toBe(TransactionStatus.COMPLETED);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockRepository.updateStatus).toHaveBeenCalled();
  });

  it('debería marcar como FAILED si Stripe falla', async () => {
    const input = { orderId: 'order-2', amount: 50 };
    
    stripeInstance.paymentIntents.create.mockRejectedValue(new Error('Stripe Error'));

    const result = await useCase.execute(input);

    expect(result.status).toBe(TransactionStatus.FAILED);
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED);
  });
});