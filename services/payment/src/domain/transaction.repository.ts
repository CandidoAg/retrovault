import { Transaction } from './transaction.entity.js';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  updateStatus(id: string, status: string): Promise<void>;
  findByOrderId(orderId: string): Promise<Transaction | null>;
}