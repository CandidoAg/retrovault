import Stripe from 'stripe';
import { Transaction, TransactionStatus } from '../domain/transaction.entity.js';
import { TransactionRepository } from '../domain/transaction.repository.js';
import { Injectable, Inject } from '@nestjs/common';

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  customerName: string;
  items: any[];
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    private readonly stripe: Stripe 
  ) {}

  async execute(input: ProcessPaymentInput): Promise<{ transaction: Transaction; checkoutUrl: string }> {
    console.log(`[PaymentUseCase] 🆕 Processing request for order ${input.orderId}...`);

    const existingTransaction = await this.transactionRepository.findByOrderId(input.orderId);

    if (existingTransaction) {
      console.log(`[PaymentUseCase] 📢 Transaction already exists for order ${input.orderId}. Returning existing session.`);
      
      const session = await this.createStripeSession(input, existingTransaction.id);
      return { transaction: existingTransaction, checkoutUrl: session.url as string };
    }

    const transaction = Transaction.create(input.orderId, input.amount);
    await this.transactionRepository.save(transaction);

    try {
      const session = await this.createStripeSession(input, transaction.id);
      return { transaction, checkoutUrl: session.url as string };
    } catch (error: any) {
      console.error(`[PaymentUseCase] ❌ Stripe Error: ${error.message}`);
      await this.transactionRepository.updateStatus(transaction.id, TransactionStatus.FAILED);
      throw error;
    }
  }

  private async createStripeSession(input: ProcessPaymentInput, transactionId: string) {
    const productSummary = input.items.reduce((acc, item) => {
      acc[item.name] = item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const productMetadata = JSON.stringify(productSummary);
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: input.items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders/status?orderId=${input.orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/orders/status?orderId=${input.orderId}&session_id={CHECKOUT_SESSION_ID}&status=cancelled`,
      metadata: { orderId: input.orderId, transactionId, productNames: productMetadata.substring(0, 500) },
    });
  }
}