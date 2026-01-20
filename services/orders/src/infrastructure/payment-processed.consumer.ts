import { Kafka } from 'kafkajs';
import { UpdateOrderStatusUseCase } from '../application/update-order-status.usecase.js';
import { PaymentCompletedEventSchema, PaymentFailedEventSchema, OrderStatus } from '@retrovault/shared';

export class PaymentProcessedConsumer {
  private consumer;

  constructor(private kafka: Kafka, private updateStatusUseCase: UpdateOrderStatusUseCase) {
    this.consumer = this.kafka.consumer({ groupId: 'orders-payment-saga-group' });
  }

  async run() {
    const admin = this.kafka.admin();
    await admin.connect();

    await admin.createTopics({
      topics: [
        { topic: 'payment-completed', numPartitions: 1 },
        { topic: 'payment-failed', numPartitions: 1 },
      ],
      waitForLeaders: true
    });
    await admin.disconnect();
    
    await this.consumer.connect();
    await this.consumer.subscribe({ 
      topics: ['payment-completed', 'payment-failed'], 
      fromBeginning: true 
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const rawPayload = JSON.parse(message.value.toString());
          let orderId: string;
          let newStatus: OrderStatus;

          if (topic === 'payment-completed') {
            const event = PaymentCompletedEventSchema.parse(rawPayload);
            orderId = event.orderId;
            newStatus = 'PAID';
          } else {
            const event = PaymentFailedEventSchema.parse(rawPayload);
            orderId = event.orderId;
            newStatus = 'CANCELLED';
          }

          console.log(`[Orders] 🔄 Updating Order ${orderId} to status: ${newStatus}`);
          
          await this.updateStatusUseCase.execute({
            orderId,
            status: newStatus
          });

        } catch (error) {
          console.error(`[Orders] ❌ Error processing payment result from topic ${topic}:`, error);
        }
      }
    });
  }
}