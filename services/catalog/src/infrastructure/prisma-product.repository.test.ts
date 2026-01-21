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
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let repository: PrismaProductRepository;

  beforeAll(async () => {
    // 1. Localizamos el schema de forma infalible
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    
    // 2. Usamos el Harness
    const setup = await TestHarness.setupPrisma({
      databaseName: 'catalog_db',
      schemaPath,
      PrismaClient,
      PrismaRepository: PrismaProductRepository
    });
    
    container = setup.container;
    prisma = setup.prisma;
    repository = setup.repository;
  }, 60000);

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  it('debería guardar un producto y recuperarlo por ID', async () => {
    const product = new Product(crypto.randomUUID(), 'Metroid Dread', 59.99, 20, 2021);

    await repository.save(product);
    const found = await repository.findById(product.id);
    
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Metroid Dread');
  });

  it('debería actualizar un producto existente (Upsert)', async () => {
    const id = crypto.randomUUID();
    const p1 = new Product(id, 'Castlevania', 30, 5, 1986);
    await repository.save(p1);

    const p2 = new Product(id, 'Castlevania', 35, 10, 1986);
    await repository.save(p2);

    const result = await repository.findById(id);
    expect(result?.price).toBe(35);
    expect(result?.stock).toBe(10);
  });

  it('debería listar todos los productos (empezando desde cero)', async () => {
    await repository.save(new Product(crypto.randomUUID(), 'Game 1', 10, 1, 2000));
    await repository.save(new Product(crypto.randomUUID(), 'Game 2', 20, 2, 2001));

    const all = await repository.findAll();
    // Gracias al beforeEach, aquí siempre habrá exactamente 2
    expect(all).toHaveLength(2);
  });
});