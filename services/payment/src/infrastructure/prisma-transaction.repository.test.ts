import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from './generated/client/index.js';
import { PrismaTransactionRepository } from './prisma-transaction.repository.js';
import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';

describe('PrismaTransactionRepository Integration', () => {
  let prisma: PrismaClient;
  let repository: PrismaTransactionRepository;

  beforeEach(async () => {
    prisma = new PrismaClient();
    repository = new PrismaTransactionRepository();
    
    // Forzamos al repositorio a usar la misma instancia conectada al contenedor
    (repository as any).prisma = prisma;

    // Limpiamos la tabla antes de cada test
    await prisma.transaction.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería guardar (save) una transacción correctamente', async () => {
    const tx = Transaction.create('order-123', 99.99);
    
    await repository.save(tx);

    const saved = await prisma.transaction.findUnique({
      where: { id: tx.id }
    });

    expect(saved).toBeDefined();
    expect(saved?.orderId).toBe('order-123');
    expect(saved?.amount).toBe(99.99);
  });

  it('debería actualizar el estado (updateStatus) de una transacción', async () => {
    const tx = Transaction.create('order-456', 50);
    await repository.save(tx);

    await repository.updateStatus(tx.id, TransactionStatus.COMPLETED);

    const updated = await prisma.transaction.findUnique({
      where: { id: tx.id }
    });

    expect(updated?.status).toBe(TransactionStatus.COMPLETED);
  });

  it('debería encontrar una transacción por su ID (findByOrderId)', async () => {
    // NOTA: Según tu código actual, buscas por record.id aunque el método diga OrderId
    const tx = Transaction.create('order-789', 25);
    await repository.save(tx);

    const found = await repository.findByOrderId(tx.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(tx.id);
    expect(found?.orderId).toBe('order-789');
  });
});