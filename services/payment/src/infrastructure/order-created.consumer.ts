import { kafka } from './kafka.client.js';
import { ProcessPaymentUseCase } from '../application/process-payment.usecase.js';
import { Transaction } from '../domain/transaction.entity.js';

export class OrderCreatedConsumer {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase, 
              private readonly onPaymentProcessed: (transaction: Transaction, items: string[]) => Promise<void>) {}

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

        const event = JSON.parse(message.value.toString());
        console.log(`[Payment] 📩 Event received: order-created for ID: ${event.orderId}`);

        // Ejecutamos la lógica de pago que definimos antes
        const transaction = await this.processPaymentUseCase.execute({
          orderId: event.orderId,
          amount: event.total,
          paymentMethodId: event.paymentMethodId
        });

        // Llamamos al callback para publicar el evento de pago procesado
        const productIds = event.items.map((item: any) => item.id || item);
        await this.onPaymentProcessed(transaction, productIds);
      },
    });
  }
}