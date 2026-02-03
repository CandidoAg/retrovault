import { kafka } from './kafka.client.js';
import { ProcessPaymentUseCase } from '../application/process-payment.usecase.js';
import { Transaction } from '../domain/transaction.entity.js';
import { OrderCreatedEventSchema } from '@retrovault/shared'; 
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OrderCreatedConsumer {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase, 
    @Inject('ON_PAYMENT_PROCESSED')
    private readonly onPaymentProcessed: (transaction: Transaction, items: string[]) => Promise<void>
  ) {}

  async run() {
    const consumer = kafka.consumer({ groupId: 'payment-group' });
    const admin = kafka.admin();

    await admin.connect();
    await consumer.connect();

    await admin.createTopics({
      topics: [{ topic: 'order-events', numPartitions: 1 }],
      waitForLeaders: true,
    });
    await admin.disconnect();

    await consumer.subscribe({ topic: 'order-events', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const rawPayload = JSON.parse(message.value.toString());
          const event = OrderCreatedEventSchema.parse(rawPayload);
          console.log(`[Payment] ✅ Event validated: order-created for ID: ${event.orderId}`);
          
          const result = await this.processPaymentUseCase.execute({
            orderId: event.orderId,
            amount: event.total,
            customerName: event.customerName || '', 
            items: event.items 
          });

          const { transaction } = result;

          const productIds = event.items.map(item => item.id);
          
          await this.onPaymentProcessed(transaction, productIds);

        } catch (error) {
          console.error(`[Payment] ❌ Error procesando evento de orden:`, error);
        }
      },
    });
  }
}