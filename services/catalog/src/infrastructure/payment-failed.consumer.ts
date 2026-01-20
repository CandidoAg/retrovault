import { Kafka } from 'kafkajs';
import { CompensateStockUseCase } from '../application/compensate-stock.usecase.js';

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
        const event = JSON.parse(message.value.toString());

        console.log(`[Catalog] ⚠️ Payment failed for order ${event.orderId}. Starting compensation...`);

        // Aquí usamos los items que vienen en el evento para devolver stock
        // (Asegúrate de que en Payment estemos enviando los items en el JSON)
        if (event.items) {
          await this.compensateStockUseCase.execute({
            items: event.items.map((id: string) => ({ id, quantity: 1 }))
          });
        }
      },
    });
  }
}