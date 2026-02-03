import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OrderStatusGateway } from './order-status.gateway.js';

describe('OrderStatusGateway', () => {
  let gateway: OrderStatusGateway;
  const mockRepo = { findByOrderId: vi.fn() };
  const mockServer = { to: vi.fn().mockReturnThis(), emit: vi.fn() };
  const mockSocket = { 
    handshake: { query: { orderId: '123' } },
    join: vi.fn(),
    emit: vi.fn()
  };

  beforeEach(() => {
    gateway = new OrderStatusGateway(mockRepo as any);
    gateway.server = mockServer as any;
    vi.clearAllMocks();
  });

  it('debería unir al cliente a la sala del pedido y emitir si ya está pagado', async () => {
    mockRepo.findByOrderId.mockResolvedValue({ status: 'COMPLETED' });
    
    await gateway.handleConnection(mockSocket as any);

    expect(mockSocket.join).toHaveBeenCalledWith('order_123');
    expect(mockSocket.emit).toHaveBeenCalledWith('order_status_changed', {
      orderId: '123',
      status: 'PAID',
    });
  });

  it('debería notificar actualizaciones de pedido', () => {
    gateway.notifyOrderUpdate('123', 'PAID');
    expect(mockServer.to).toHaveBeenCalledWith('order_123');
    expect(mockServer.emit).toHaveBeenCalledWith('order_status_changed', {
      orderId: '123',
      status: 'PAID',
    });
  });
});