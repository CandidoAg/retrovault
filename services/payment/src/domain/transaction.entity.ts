export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly status: TransactionStatus,
    public readonly createdAt: Date
  ) {}

  static create(orderId: string, amount: number): Transaction {
    // Aquí podrías meter validaciones de dominio si el monto es negativo, etc.
    return new Transaction(
      crypto.randomUUID(),
      orderId,
      amount,
      TransactionStatus.PENDING,
      new Date()
    );
  }
}