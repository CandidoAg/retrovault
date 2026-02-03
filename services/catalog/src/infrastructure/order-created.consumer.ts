import { kafka } from './kafka.client.js';
import { DecreaseStockUseCase } from '../application/decrease-stock.usecase.js';
import { OrderCreatedEventSchema } from '@retrovault/shared'; 
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderCreatedConsumer {
  private consumer = kafka.consumer({ groupId: 'catalog-group' });

  constructor(private decreaseStock: DecreaseStockUseCase) {}

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'order-events', fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const rawPayload = JSON.parse(message.value.toString());
          const event = OrderCreatedEventSchema.parse(rawPayload);
          
          console.log(`[Catalog] 📦 Processing stock reservation for order: ${event.orderId}`);

          for (const item of event.items) {
            await this.decreaseStock.execute(item.name, item.quantity);
          }
        } catch (error) {
          console.error('[Catalog] ❌ Invalid order-created event:', error);
        }
      }
    });
  }
}