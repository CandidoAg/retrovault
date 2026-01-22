import { describe, it, expect } from 'vitest';
import { Transaction, TransactionStatus } from './transaction.entity.js'; 

describe('Transaction Entity', () => {
  it('debería crear una transacción con estado PENDING por defecto', () => {
    const orderId = 'order-123';
    const amount = 59.99;

    const transaction = Transaction.create(orderId, amount);

    expect(transaction.id).toBeDefined();
    expect(transaction.orderId).toBe(orderId);
    expect(transaction.amount).toBe(amount);
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });

  it('debería generar IDs únicos para diferentes transacciones', () => {
    const t1 = Transaction.create('order-1', 10);
    const t2 = Transaction.create('order-2', 20);

    expect(t1.id).not.toBe(t2.id);
  });
});