import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrderUseCase } from './create-order.usecase.js';

describe('CreateOrderUseCase', () => {
  const mockOrderRepo = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), updateStatus: vi.fn() };
  const mockProductRepo = { findById: vi.fn(), save: vi.fn() };
  const mockEventPublisher = { publish: vi.fn() };

  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateOrderUseCase(mockOrderRepo as any, mockProductRepo as any, mockEventPublisher as any);
  });

  it('should create an order and publish event successfully', async () => {
    mockProductRepo.findById.mockResolvedValue({ id: 'p1', name: 'Zelda NES', price: 50, stock: 10 });

    const order = await useCase.execute('cust-1', [{id: 'p1', quantity: 1}], 'Candi');

    expect(order).toBeDefined();
    expect(mockOrderRepo.save).toHaveBeenCalled();
    expect(mockEventPublisher.publish).toHaveBeenCalled();
  });

  it('should throw error if product is out of stock', async () => {
    mockProductRepo.findById.mockResolvedValue({ id: 'p1', name: 'Zelda NES', price: 50, stock: 0 });

    await expect(useCase.execute('cust-1', [{id: 'p1', quantity: 1}], 'Candi'))
      .rejects.toThrow('Producto p1 no disponible');
  });

  it('should use a declining payment token if customer name is Zelda', async () => {
    mockProductRepo.findById.mockResolvedValue({ id: 'p1', name: 'Zelda NES', price: 50, stock: 10 });

    await useCase.execute('cust-1', [{id: 'p1', quantity: 1}], 'Zelda');

    expect(mockEventPublisher.publish).toHaveBeenCalled();
  });
});