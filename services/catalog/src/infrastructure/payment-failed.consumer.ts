import { Kafka } from 'kafkajs';
import { CompensateStockUseCase } from '../application/compensate-stock.usecase.js';
import { PaymentFailedEventSchema } from '@retrovault/shared';

export class PaymentFailedConsumer {
  private consumer;

  constructor(private kafka: Kafka, private compensateStockUseCase: CompensateStockUseCase) {
    this.consumer = this.kafka.consumer({ groupId: 'catalog-compensation-group' });
  }

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'payment-failed', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const rawPayload = JSON.parse(message.value.toString());
          const event = PaymentFailedEventSchema.parse(rawPayload);

          console.log(`[Catalog] ⚠️ Payment failed for order ${event.orderId}. Starting compensation...`);

          await this.compensateStockUseCase.execute({
            items: event.productIds.map((id) => ({ id, quantity: 1 }))
          });

          console.log(`[Catalog] ✅ Compensation completed for order ${event.orderId}`);

        } catch (error) {
          console.error(`[Catalog] ❌ Error processing compensation: Invalid event format`, error);
        }
      },
    });
  }
}