import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DecreaseStockUseCase } from './decrease-stock.usecase.js';
import { Product } from '../domain/product.entity.js';

describe('DecreaseStockUseCase', () => {
  const mockRepo = {
    findById: vi.fn(),
    save: vi.fn(),
  };

  const mockPublisher = {
    publish: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería restar stock y publicar el evento si el producto existe', async () => {
    const product = new Product('prod-1', 'Mario', 40, 10, 1985);
    mockRepo.findById.mockResolvedValue(product);

    const useCase = new DecreaseStockUseCase(mockRepo as any, mockPublisher as any);
    await useCase.execute('prod-1', 3);

    expect(product.stock).toBe(7);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'prod-1', stock: 7 }));
    expect(mockPublisher.publish).toHaveBeenCalled();
  });

  it('debería lanzar un error (o manejarlo) si el producto no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const useCase = new DecreaseStockUseCase(mockRepo as any, mockPublisher as any);

    await useCase.execute('id-falso', 1);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});