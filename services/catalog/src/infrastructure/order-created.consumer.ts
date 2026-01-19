import { kafka } from './kafka.client.js';
import { DecreaseStockUseCase } from '../application/decrease-stock.usecase.js';

export class OrderCreatedConsumer {
  private consumer = kafka.consumer({ groupId: 'catalog-group' });

  constructor(private decreaseStock: DecreaseStockUseCase) {}

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'order-events', fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        
        // Si el evento viene de Orders, debería traer los items con su ID
        for (const item of event.items) {
          if (item.id) {
            await this.decreaseStock.execute(item.id, 1);
          }
        }
      }
    });
  }
}