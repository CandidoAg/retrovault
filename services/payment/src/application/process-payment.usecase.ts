import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';
import { TransactionRepository } from '../domain/transaction.repository.js';

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
}

export class ProcessPaymentUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(input: ProcessPaymentInput): Promise<Transaction> {
    console.log(`[PaymentUseCase] 🆕 Registering payment attempt for order ${input.orderId}...`);

    // 1. REGISTRO INICIAL
    const transaction = Transaction.create(input.orderId, input.amount);
    await this.transactionRepository.save(transaction);

    // 2. LÓGICA DE NEGOCIO (Simulación)
    const isPricePatternFail = input.amount.toString().endsWith('.99');
    const finalStatus = isPricePatternFail ? TransactionStatus.FAILED : TransactionStatus.COMPLETED;

    // 3. ACTUALIZACIÓN FINAL
    console.log(`[PaymentUseCase] 🔄 Updating transaction status to ${finalStatus}...`);
    await this.transactionRepository.updateStatus(transaction.id, finalStatus);

    // Retornamos una nueva instancia con el estado actualizado para el resto del flujo
    return new Transaction(
      transaction.id,
      transaction.orderId,
      transaction.amount,
      finalStatus,
      transaction.createdAt
    );
  }
}