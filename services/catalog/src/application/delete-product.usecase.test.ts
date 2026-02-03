// src/application/delete-product.usecase.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProductUseCase } from './delete-product.usecase.js';
import { Product } from '../domain/product.entity.js';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new DeleteProductUseCase(mockRepository);
  });

  it('debería ejecutar el borrado si el producto existe en el repositorio', async () => {
    const product = new Product('1', 'Sonic', 30, 10, 1991, 'Sega');
    
    mockRepository.findById.mockResolvedValue(product);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('1');

    expect(mockRepository.findById).toHaveBeenCalledWith('1');
    expect(mockRepository.delete).toHaveBeenCalledWith('1');
  });

  it('debería lanzar un error si intenta borrar un producto inexistente', async () => {
    // Simulamos que el producto no se encuentra
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow('El producto no existe');
    
    // Verificamos que NUNCA se llamó al método delete del repo
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});