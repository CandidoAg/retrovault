import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaOrderRepository } from './prisma-order.repository.js';
import { Order } from '../domain/order.entity.js';
import { PrismaClient } from './generated/client/index.js';

describe('PrismaOrderRepository', () => {
  let prisma: PrismaClient;
  let repository = new PrismaOrderRepository();

  beforeEach(async () => {
     prisma = new PrismaClient();
     repository = new PrismaOrderRepository();
     (repository as any).prisma = prisma; // Inyectamos el cliente
    
     await prisma.order.deleteMany();
     await prisma.catalogProduct.deleteMany();
  });

  it('should save and find an order', async () => {
    const order = new Order('ord-123', 'cust-456', [], 'PENDING');
    
    await repository.save(order);
    const found = await repository.findById('ord-123');

    expect(found).not.toBeNull();
    expect(found?.id).toBe('ord-123');
    expect(found?.customerId).toBe('cust-456');
  });

  it('should update order status', async () => {
    const order = new Order('ord-update', 'cust-1', [], 'PENDING');
    await repository.save(order);

    await repository.updateStatus('ord-update', 'PAID');
    
    const updated = await repository.findById('ord-update');
    expect(updated?.status).toBe('PAID');
  });

  it('should return null when order not found', async () => {
    const found = await repository.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should find all orders', async () => {
    await repository.save(new Order('ord-1', 'cust-1', [], 'PENDING'));
    await repository.save(new Order('ord-2', 'cust-1', [], 'PENDING'));

    const all = await repository.findAll();
    expect(all).toHaveLength(2);
    });
});