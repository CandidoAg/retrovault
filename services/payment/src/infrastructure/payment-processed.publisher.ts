import { kafka } from './kafka.client.js';
import { Transaction } from '../domain/transaction.entity.js';
import { PaymentFailedEventSchema } from '@retrovault/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentProcessedPublisher {
  private producer = kafka.producer();

  async publish(transaction: Transaction, items: string) {
    await this.producer.connect();
    

    const isSuccess = transaction.status === 'COMPLETED';
    const topic = isSuccess ? 'payment-completed' : 'payment-failed';

    const payload: any = {
      transactionId: transaction.id,
      orderId: transaction.orderId,
      amount: transaction.amount,
      status: transaction.status,
      productNames: items, 
      occurredAt: new Date().toISOString()
    };

    if (!isSuccess) {
      payload.reason = "Stripe Payment Failed";
      PaymentFailedEventSchema.parse(payload);
    }

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });

    console.log(`[Payment] 📤 Event published: ${topic} for Order: ${transaction.orderId}`);
  }
}