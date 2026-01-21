import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateOrderStatusUseCase } from './update-order-status.usecase.js';

describe('UpdateOrderStatusUseCase', () => {
  // Definimos una función que genera un mock nuevo cada vez
  const createMockRepo = () => ({
    findById: vi.fn(),
    updateStatus: vi.fn(),
    save: vi.fn(),
    findAll: vi.fn()
  });

  it('should update status when order exists', async () => {
    const mockOrderRepo = createMockRepo();
    const useCase = new UpdateOrderStatusUseCase(mockOrderRepo as any);
    mockOrderRepo.findById.mockResolvedValue({ id: 'order-1' });

    await useCase.execute({ orderId: 'order-1', status: 'PAID' as any });

    expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'PAID');
  });

  it('should not update and log error when order does not exist', async () => {
    const mockOrderRepo = createMockRepo();
    const useCase = new UpdateOrderStatusUseCase(mockOrderRepo as any);
    mockOrderRepo.findById.mockResolvedValue(null);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await useCase.execute({ orderId: 'invalid', status: 'PAID' as any });

    expect(mockOrderRepo.updateStatus).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});