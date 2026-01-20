import { Kafka } from 'kafkajs';
import { UpdateOrderStatusUseCase } from '../application/update-order-status.usecase.js';

export class PaymentProcessedConsumer {
  private consumer;

  constructor(private kafka: Kafka, private updateStatusUseCase: UpdateOrderStatusUseCase) {
    this.consumer = this.kafka.consumer({ groupId: 'orders-payment-saga-group' });
  }

  async run() {
    await this.consumer.connect();
    // Escuchamos AMBOS tópicos que crea el servicio de Payment
    await this.consumer.subscribe({ 
      topics: ['payment-completed', 'payment-failed'], 
      fromBeginning: true 
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        
        // Mapeo: si el tópico es completed -> PAID, si no -> CANCELLED
        const newStatus = topic === 'payment-completed' ? 'PAID' : 'CANCELLED';
        
        await this.updateStatusUseCase.execute({
          orderId: event.orderId,
          status: newStatus
        });
      }
    });
  }
}