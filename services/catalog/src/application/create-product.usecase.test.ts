import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProductUseCase } from './create-product.usecase.js';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepo: any;
  let mockPublisher: any;

  beforeEach(() => {
    mockRepo = { save: vi.fn().mockResolvedValue(undefined) };
    mockPublisher = { publish: vi.fn().mockResolvedValue(undefined) };
    useCase = new CreateProductUseCase(mockRepo, mockPublisher);
  });

  it('debe guardar el producto y publicar el evento', async () => {
    const input = { name: 'Zelda NES', price: 50, stock: 10, year: 1986 , brand: 'Nintendo' };
    
    const result = await useCase.execute(input);

    expect(result.name).toBe('Zelda NES');
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockPublisher.publish).toHaveBeenCalledWith(result);
  });
});