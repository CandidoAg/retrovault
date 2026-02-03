import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PaymentController } from './payment.controller.js';
import { BadRequestException } from '@nestjs/common';

describe('PaymentController', () => {
  let controller: PaymentController;
  const mockUseCase = { execute: vi.fn() };

  beforeEach(() => {
    controller = new PaymentController(mockUseCase as any);
  });

  it('debería retornar la URL de checkout', async () => {
    const mockResponse = { transaction: { id: 'trx_1' }, checkoutUrl: 'http://stripe.com' };
    mockUseCase.execute.mockResolvedValue(mockResponse);

    const result = await controller.createCheckout({ orderId: '123' });

    expect(result).toEqual({ checkoutUrl: 'http://stripe.com', transactionId: 'trx_1' });
  });

  it('debería lanzar BadRequestException si el caso de uso falla', async () => {
    mockUseCase.execute.mockRejectedValue(new Error('Stripe error'));
    await expect(controller.createCheckout({})).rejects.toThrow(BadRequestException);
  });
});