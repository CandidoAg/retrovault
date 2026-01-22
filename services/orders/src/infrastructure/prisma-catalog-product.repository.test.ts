import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaCatalogProductRepository } from './prisma-catalog-product.repository.js';
import { CatalogProduct } from '../domain/catalog-product.entity.js';
import { PrismaClient } from './generated/client/index.js';

describe('PrismaCatalogProductRepository', () => {
  let prisma = new PrismaClient();
  let repository = new PrismaCatalogProductRepository();

  beforeEach(async () => {
     prisma = new PrismaClient();
     repository = new PrismaCatalogProductRepository();
     (repository as any).prisma = prisma; // Inyectamos el cliente
    
     await prisma.order.deleteMany();
     await prisma.catalogProduct.deleteMany();
  });

  it('should save a product (create)', async () => {
    const product = new CatalogProduct('p-1', 'Game Boy', 100, 5);
    
    await repository.save(product);
    const found = await repository.findById('p-1');

    expect(found?.name).toBe('Game Boy');
  });

  it('should upsert a product (update if exists)', async () => {
    const product = new CatalogProduct('p-1', 'Game Boy', 100, 5);
    await repository.save(product);

    // Actualizamos el mismo ID con nuevo stock
    const updatedProduct = new CatalogProduct('p-1', 'Game Boy', 100, 10);
    await repository.save(updatedProduct);

    const found = await repository.findById('p-1');
    expect(found?.stock).toBe(10);
  });

  it('should find all products', async () => {
    await repository.save(new CatalogProduct('p-1', 'A', 10, 1));
    await repository.save(new CatalogProduct('p-2', 'B', 20, 2));

    const all = await repository.findAll();
    expect(all).toHaveLength(2);
  });
});