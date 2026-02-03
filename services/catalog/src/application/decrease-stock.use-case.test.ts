import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DecreaseStockUseCase } from './decrease-stock.usecase.js';
import { Product } from '../domain/product.entity.js';

describe('DecreaseStockUseCase', () => {
  const mockRepo = {
    findByName: vi.fn(), 
    save: vi.fn(),
  };

  const mockPublisher = {
    publish: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería restar stock y publicar el evento si el producto existe', async () => {
    const product = new Product('prod-1', 'Mario', 40, 10, 1985, 'Nintendo');
    mockRepo.findByName.mockResolvedValue(product); 

    const useCase = new DecreaseStockUseCase(mockRepo as any, mockPublisher as any);
    await useCase.execute('Mario', 3);
    expect(product.stock).toBe(7);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Mario', stock: 7 }));
    expect(mockPublisher.publish).toHaveBeenCalled();
  });

  it('debería manejar el caso si el producto no existe', async () => {
    mockRepo.findByName.mockResolvedValue(null); 
    const useCase = new DecreaseStockUseCase(mockRepo as any, mockPublisher as any);

    await useCase.execute('id-falso', 1);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});