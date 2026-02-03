import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from './generated/client/index.js';
import { PrismaProductRepository } from './prisma-product.repository.js';
import { Product } from '../domain/product.entity.js';
import { TestHarness } from '@retrovault/shared';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper para rutas en ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('PrismaProductRepository con Testcontainers', () => {
  let prisma: PrismaClient;
  let repository: PrismaProductRepository;

  beforeEach(async () => {
    prisma = new PrismaClient();
    repository = new PrismaProductRepository();
    (repository as any).prisma = prisma; // Inyectamos el cliente

    await prisma.product.deleteMany();
  });

  it('debería guardar un producto y recuperarlo por ID', async () => {
    const product = new Product(crypto.randomUUID(), 'Metroid Dread', 59.99, 20, 2021, 'Nintendo');

    await repository.save(product);
    const found = await repository.findById(product.id);
    
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Metroid Dread');
  });

  it('debería actualizar un producto existente (Upsert)', async () => {
    const id = crypto.randomUUID();
    const p1 = new Product(id, 'Castlevania', 30, 5, 1986, 'Nintendo');
    await repository.save(p1);

    const p2 = new Product(id, 'Castlevania', 35, 10, 1986, 'Nintendo');
    await repository.save(p2);

    const result = await repository.findById(id);
    expect(result?.price).toBe(35);
    expect(result?.stock).toBe(10);
  });

  it('debería listar todos los productos (empezando desde cero)', async () => {
    await repository.save(new Product(crypto.randomUUID(), 'Game 1', 10, 1, 2000, 'Nintendo', "description 1", 4.5));
    await repository.save(new Product(crypto.randomUUID(), 'Game 2', 20, 2, 2001, 'Nintendo', "description 2", 4.5));

    const all = await repository.findAll();
    // Gracias al beforeEach, aquí siempre habrá exactamente 2
    expect(all).toHaveLength(2);
  });

  it('debería retornar null si el producto no existe por ID', async () => {
    const found = await repository.findById('non-existent-uuid');
    expect(found).toBeNull();
  });

  it('debería buscar un producto por nombre', async () => {
    const name = 'Zelda Ocarina';
    const product = new Product(crypto.randomUUID(), name, 60, 5, 1998, 'Nintendo');
    await repository.save(product);

    const found = await repository.findByName(name);
    expect(found).not.toBeNull();
    expect(found?.name).toBe(name);
  });

  it('debería retornar null si el producto no existe por nombre', async () => {
    const found = await repository.findByName('Ghost Game');
    expect(found).toBeNull();
  });

  it('debería manejar productos sin descripción o rating (valores por defecto)', async () => {
    // Forzamos un producto que use los operadores ?? del repositorio
    const id = crypto.randomUUID();
    await prisma.product.create({
      data: {
        id,
        name: 'Empty Game',
        price: 10,
        stock: 1,
        year: 1990,
        brand: 'Sega',
        description: undefined, 
        rating: undefined       
      }
    });

    const found = await repository.findById(id);
    expect(found?.description).toBeUndefined();
    expect(found?.rating).toBe(0);
  });
  
  it('debería actualizar un producto mediante el método update', async () => {
    const id = crypto.randomUUID();
    const product = new Product(id, 'F-Zero', 20, 5, 1990, 'Nintendo');
    await repository.save(product);

    const updated = await repository.update(id, { price: 25, stock: 2 });
    
    expect(updated.price).toBe(25);
    expect(updated.stock).toBe(2);
    expect(updated.name).toBe('F-Zero'); // El nombre debería mantenerse
  });

  it('debería eliminar un producto correctamente', async () => {
    const id = crypto.randomUUID();
    const product = new Product(id, 'Star Fox', 40, 10, 1993, 'Nintendo');
    await repository.save(product);

    await repository.delete(id);
    
    const found = await repository.findById(id);
    expect(found).toBeNull();
  });
});