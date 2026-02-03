import { Module } from '@nestjs/common';
import { PaymentController } from './infrastructure/http/payment.controller.js';
import { StripeWebhookController } from './infrastructure/http/stripe-webhook.controller.js';
import { ProcessPaymentUseCase } from './application/process-payment.usecase.js';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository.js'; // Asegúrate de que existe
import Stripe from 'stripe';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { PaymentProcessedPublisher } from './infrastructure/payment-processed.publisher.js';
import { OrderStatusGateway } from './infrastructure/gateways/order-status.gateway.js';

@Module({
  controllers: [
    PaymentController, 
    StripeWebhookController
  ],
  providers: [
    OrderStatusGateway,
    ProcessPaymentUseCase,
    OrderCreatedConsumer,
    PaymentProcessedPublisher,
    // Registro del repositorio con el token que espera el Controller
    {
      provide: 'TransactionRepository',
      useClass: PrismaTransactionRepository,
    },
    // Cliente de Stripe
    {
      provide: Stripe,
      useFactory: () => new Stripe(process.env.STRIPE_SECRET_KEY || ''),
    },
    {
      provide: 'ON_PAYMENT_PROCESSED',
      useValue: async (transaction: any) => {
        console.log(`[Event] Transacción ${transaction.id} lista para procesar.`);
      },
    },
  ],
  exports: [ProcessPaymentUseCase, 'TransactionRepository']
})
export class PaymentModule {}