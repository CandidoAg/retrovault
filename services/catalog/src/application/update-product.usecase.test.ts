import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProductUseCase } from './update-product.usecase.js';
import { Product } from '../domain/product.entity.js';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      update: vi.fn(),
    };
    useCase = new UpdateProductUseCase(mockRepository);
  });

  it('debería actualizar los datos del producto y devolver la entidad', async () => {
    const productId = 'uuid-123';
    const updateData = { price: 75.0, stock: 20 };
    
    // Lo que esperamos que devuelva el repo (entidad de dominio)
    const mockUpdatedProduct = new Product(
      productId, 'Castlevania', 75.0, 20, 1997, 'Konami', 'Symphony of the Night', 5.0
    );

    mockRepository.update.mockResolvedValue(mockUpdatedProduct);

    const result = await useCase.execute(productId, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(productId, updateData);
    expect(result).toBeInstanceOf(Product);
    expect(result.price).toBe(75.0);
    expect(result.name).toBe('Castlevania');
  });
});