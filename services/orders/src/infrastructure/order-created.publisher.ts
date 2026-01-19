import { kafka } from './kafka.client.js';
import { OrderCreatedEvent } from '../domain/order-created.event.js';

export class OrderCreatedPublisher {
  private producer = kafka.producer();

  async publish(event: OrderCreatedEvent): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic: 'order-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    console.log(`📢 [Kafka] Evento de pedido publicado: ${event.orderId}`);
  }
}