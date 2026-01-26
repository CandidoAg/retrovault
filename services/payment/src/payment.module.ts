import { Module } from '@nestjs/common';
import { ProcessPaymentUseCase } from './application/process-payment.usecase.js';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository.js';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { PaymentProcessedPublisher } from './infrastructure/payment-processed.publisher.js';

@Module({
  providers: [
    PrismaTransactionRepository,
    PaymentProcessedPublisher,
    {
      provide: ProcessPaymentUseCase,
      useFactory: (repo: PrismaTransactionRepository) => new ProcessPaymentUseCase(repo),
      inject: [PrismaTransactionRepository],
    },
    {
      provide: OrderCreatedConsumer,
      useFactory: (useCase: ProcessPaymentUseCase, publisher: PaymentProcessedPublisher) => {
        return new OrderCreatedConsumer(useCase, async (transaction, items) => {
          await publisher.publish(transaction, items);
        });
      },
      inject: [ProcessPaymentUseCase, PaymentProcessedPublisher],
    },
  ],
})
export class PaymentModule {}