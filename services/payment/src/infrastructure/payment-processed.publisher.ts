import { kafka } from './kafka.client.js';
import { Transaction } from '../domain/transaction.entity.js';

export class PaymentProcessedPublisher {
  private producer = kafka.producer();

  async publish(transaction: Transaction, items: string[]) {
    await this.producer.connect();
    
    const topic = transaction.status === 'COMPLETED' ? 'payment-completed' : 'payment-failed';

    await this.producer.send({
      topic,
      messages: [
        { 
          value: JSON.stringify({
            transactionId: transaction.id,
            orderId: transaction.orderId,
            amount: transaction.amount,
            status: transaction.status,
            items: items,
            occurredAt: new Date()
          }) 
        },
      ],
    });

    console.log(`[Payment] 📤 Event published: ${topic} for Order: ${transaction.orderId}`);
  }
}