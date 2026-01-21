import { describe, it, expect, vi } from 'vitest';
import { SyncInventoryUseCase } from './sync-inventory.usecase.js';

describe('SyncInventoryUseCase', () => {
  it('should sync product data into the local repository', async () => {
    const mockProductRepo = { save: vi.fn(), findById: vi.fn() };
    const useCase = new SyncInventoryUseCase(mockProductRepo as any);
    const productData = { id: 'p1', name: 'Console', price: 100, stock: 5 };

    await useCase.execute(productData);

    expect(mockProductRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 'p1',
      price: 100
    }));
  });
});