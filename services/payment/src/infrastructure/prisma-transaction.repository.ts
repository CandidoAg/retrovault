import { PrismaClient } from './generated/client/index.js';
import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';
import { TransactionRepository } from '../domain/transaction.repository.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async save(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        orderId: transaction.orderId,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    await this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  async findByOrderId(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!record) return null;

    // Mapeo de la base de datos al dominio (reconstrucción de la entidad)
    return new Transaction(
      record.id,
      record.orderId,
      record.amount,
      record.status as TransactionStatus,
      record.createdAt
    );
  }
}