import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompensateStockUseCase } from './compensate-stock.usecase.js';
import { Product } from '../domain/product.entity.js';

describe('CompensateStockUseCase', () => {
  const mockRepo = {
    findById: vi.fn(),
    save: vi.fn(),
    findAll: vi.fn()
  };

  const mockPublisher = {
    publish: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería sumar stock de vuelta y publicar el evento para cada item', async () => {
    const product = new Product('prod-123', 'Zelda', 50, 10, 1986);
    mockRepo.findById.mockResolvedValue(product);
    
    const useCase = new CompensateStockUseCase(mockRepo as any, mockPublisher as any);
    const input = { items: [{ id: 'prod-123', quantity: 5 }] };

    await useCase.execute(input);

    // Verificamos que sumó: 10 + 5 = 15
    expect(product.stock).toBe(15);
    expect(mockRepo.save).toHaveBeenCalledWith(product);
    expect(mockPublisher.publish).toHaveBeenCalledWith(product);
  });
});