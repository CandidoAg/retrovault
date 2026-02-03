import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StripeWebhookController } from './stripe-webhook.controller.js';
import { BadRequestException } from '@nestjs/common';

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;
  
  // Mocks con implementaciones base
  const mockRepo = { findByOrderId: vi.fn(), updateStatus: vi.fn() };
  const mockStripe = { 
    webhooks: { constructEvent: vi.fn() },
    checkout: { sessions: { list: vi.fn() } } 
  };
  const mockPublisher = { publish: vi.fn() };
  const mockGateway = { notifyOrderUpdate: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new StripeWebhookController(
      mockRepo as any,
      mockStripe as any,
      mockPublisher as any,
      mockGateway as any
    );
  });

  it('debería procesar checkout.session.completed con éxito', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order_1', transactionId: 'trx_1' } } }
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(event);
    mockRepo.findByOrderId.mockResolvedValue({ id: 'trx_1' });

    await controller.handleStripeWebhook({ rawBody: {} }, 'sig');

    expect(mockRepo.updateStatus).toHaveBeenCalledWith('trx_1', 'COMPLETED');
    expect(mockGateway.notifyOrderUpdate).toHaveBeenCalledWith('order_1', 'PAID');
    expect(mockPublisher.publish).toHaveBeenCalled();
  });

  it('debería manejar checkout.session.expired (pago fallido)', async () => {
    const event = {
      type: 'checkout.session.expired',
      data: { object: { metadata: { orderId: 'order_1', transactionId: 'trx_1' } } }
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    await controller.handleStripeWebhook({ rawBody: {} }, 'sig');

    // Nota: En tu código handlePaymentFailure usa 'transactionId' directamente
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('trx_1', expect.anything());
    expect(mockGateway.notifyOrderUpdate).toHaveBeenCalledWith('order_1', 'FAILED');
  });

  it('debería retornar si no hay metadata en el evento', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: { object: { metadata: {} } } // Sin IDs
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    const result = await controller.handleStripeWebhook({ rawBody: {} }, 'sig');
    
    expect(result).toEqual({ received: true });
    expect(mockRepo.findByOrderId).not.toHaveBeenCalled();
  });

  it('debería fallar si la firma es inválida', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await expect(controller.handleStripeWebhook({}, 'bad-sig')).rejects.toThrow(BadRequestException);
  });

  it('debería loguear error si la transacción no existe en DB durante éxito', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order_999', transactionId: 'trx_1' } } }
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(event);
    mockRepo.findByOrderId.mockResolvedValue(null); // No existe

    await controller.handleStripeWebhook({ rawBody: {} }, 'sig');
    
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });

  describe('manualCancel', () => {
    it('debería cancelar manualmente una orden existente', async () => {
      const orderId = 'order_123';
      mockRepo.findByOrderId.mockResolvedValue({ id: 'trx_123' });
      mockStripe.checkout.sessions.list.mockResolvedValue({
        data: [{ metadata: { orderId, productNames: 'Producto Test' } }]
      });

      const result = await controller.manualCancel({ orderId });

      expect(result.success).toBe(true);
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('trx_123', 'FAILED');
      expect(mockPublisher.publish).toHaveBeenCalledWith(expect.anything(), 'Producto Test');
    });

    it('debería lanzar error si la orden no existe en manualCancel', async () => {
      mockRepo.findByOrderId.mockResolvedValue(null);
      await expect(controller.manualCancel({ orderId: '404' })).rejects.toThrow(BadRequestException);
    });
  });
});