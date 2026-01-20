import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository.js';
import { ProcessPaymentUseCase } from './application/process-payment.usecase.js';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { PaymentProcessedPublisher } from './infrastructure/payment-processed.publisher.js';
import { Transaction } from './domain/transaction.entity.js'; // Importamos el tipo para el callback

async function run() {
  console.log('🚀 [Payment Service] Online. Escuchando eventos de pagos...');

  const transactionRepository = new PrismaTransactionRepository();
  const paymentPublisher = new PaymentProcessedPublisher();
  const processPaymentUseCase = new ProcessPaymentUseCase(transactionRepository);

  // Corregimos el tipado (transaction: Transaction) y el orden de los argumentos
  const orderCreatedConsumer = new OrderCreatedConsumer(
    processPaymentUseCase,
    async (transaction: Transaction, items: string[]) => {
      await paymentPublisher.publish(transaction, items);
    }
  );

  await orderCreatedConsumer.run().catch((err) => {
    console.error('[Payment] Error starting consumer:', err);
  });
}

run();