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
    
     await prisma.orderItem.deleteMany();
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
  
  it('should find orders by customer id with formatted items and dates', async () => {
    const customerId = 'cust-999';
    const orderId = 'ord-complex-1';
    
    // Creamos la orden con items
    const order = new Order(orderId, customerId, [
      { id: 'prod-1', name: 'Mario', price: 10, quantity: 1, stock: 1 },
    ], 'PAID');
    
    await repository.save(order);

    const results = await repository.findByCustomerId(customerId);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(orderId);
    expect(results[0].items[0].name).toBe('Mario');
    expect(results[0].items[0].price).toBe(10);
    
    expect((results[0] as any).createdAt).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should return empty array if customer has no orders', async () => {
    const results = await repository.findByCustomerId('ghost-customer');
    expect(results).toEqual([]);
  });
});