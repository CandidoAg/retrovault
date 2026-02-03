// services/catalog/src/infrastructure/seed.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SeedService } from './seed.service.js';
import { ProductRepository } from '../domain/product.repository.js';

describe('SeedService', () => {
  let service: SeedService;
  let productRepositoryMock: ProductRepository;

  beforeEach(() => {
    productRepositoryMock = {
      findAll: vi.fn(),
      save: vi.fn(),
      findByName: vi.fn(),
      findById: vi.fn()
    } as unknown as ProductRepository;

    service = new SeedService(productRepositoryMock);
  });

  it('debería insertar productos si la base de datos está vacía', async () => {
    vi.mocked(productRepositoryMock.findAll).mockResolvedValue([]); // BD Vacía
    
    await service.onModuleInit();

    expect(productRepositoryMock.save).toHaveBeenCalled();
    expect(vi.mocked(productRepositoryMock.save).mock.calls.length).toBeGreaterThan(0);
  });

  it('NO debería insertar nada si ya hay productos', async () => {
    vi.mocked(productRepositoryMock.findAll).mockResolvedValue([{ id: '1' } as any]);
    
    await service.onModuleInit();

    expect(productRepositoryMock.save).not.toHaveBeenCalled();
  });
});