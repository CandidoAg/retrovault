import { describe, it, expect } from 'vitest';
import { Order } from './order.entity.js';
import { RetroProduct } from '@retrovault/shared';

describe('Order Entity', () => {
  const mockProducts: RetroProduct[] = [
    { id: '1', name: 'GameBoy', price: 100, stock: 5, quantity: 1 },
    { id: '2', name: 'NES', price: 200, stock: 2, quantity: 1 },
  ];

  it('should create an order with PENDING status by default', () => {
    const order = new Order('order-123', 'customer-456', mockProducts);
    
    expect(order.id).toBe('order-123');
    expect(order.status).toBe('PENDING');
    expect(order.createdAt).toBeInstanceOf(Date);
  });

  it('should calculate the total price correctly based on items', () => {
    const order = new Order('order-123', 'customer-456', mockProducts);
    
    // 100 + 200 = 300
    expect(order.total).toBe(300);
  });

  it('should return 0 total if there are no items', () => {
    const order = new Order('order-123', 'customer-456', []);
    expect(order.total).toBe(0);
  });
});