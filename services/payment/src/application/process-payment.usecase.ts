import Stripe from 'stripe';
import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';
import { TransactionRepository } from '../domain/transaction.repository.js';

// Inicializamos Stripe (asegúrate de tener STRIPE_SECRET_KEY en tu .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  paymentMethodId?: string;
}

export class ProcessPaymentUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(input: ProcessPaymentInput): Promise<Transaction> {
    console.log(`[PaymentUseCase] 🆕 Registering payment attempt for order ${input.orderId} via Stripe...`);

    // 1. REGISTRO INICIAL (Estado PENDING por defecto)
    const transaction = Transaction.create(input.orderId, input.amount);
    await this.transactionRepository.save(transaction);

    let finalStatus: TransactionStatus;

    try {
      // 2. LÓGICA DE NEGOCIO REAL CON STRIPE
      // Nota: Stripe usa céntimos, multiplicamos por 100
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(input.amount * 100),
        currency: 'usd',
        payment_method: input.paymentMethodId || 'pm_card_visa', // Tarjeta de éxito por defecto
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      finalStatus = paymentIntent.status === 'succeeded' 
        ? TransactionStatus.COMPLETED 
        : TransactionStatus.FAILED;

    } catch (error: any) {
      console.error(`[PaymentUseCase] ❌ Stripe Error: ${error.message}`);
      finalStatus = TransactionStatus.FAILED;
    }

    // 3. ACTUALIZACIÓN FINAL EN TU DB
    console.log(`[PaymentUseCase] 🔄 Updating transaction status to ${finalStatus}...`);
    await this.transactionRepository.updateStatus(transaction.id, finalStatus);

    return new Transaction(
      transaction.id,
      transaction.orderId,
      transaction.amount,
      finalStatus,
      transaction.createdAt
    );
  }
}