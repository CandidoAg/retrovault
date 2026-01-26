import { Module, OnModuleInit } from '@nestjs/common';
import { OrderController } from './infrastructure/http/order.controller.js';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository.js';
import { PrismaCatalogProductRepository } from './infrastructure/prisma-catalog-product.repository.js';
import { ProductCreatedConsumer } from './infrastructure/product-created.consumer.js';
import { PaymentProcessedConsumer } from './infrastructure/payment-processed.consumer.js';
import { CreateOrderUseCase } from './application/create-order.usecase.js';
import { UpdateOrderStatusUseCase } from './application/update-order-status.usecase.js';
import { OrderCreatedPublisher } from './infrastructure/order-created.publisher.js';
import { kafka } from './infrastructure/kafka.client.js';

@Module({
  controllers: [OrderController],
  providers: [
    PrismaOrderRepository,
    PrismaCatalogProductRepository,
    OrderCreatedPublisher,
    // Casos de Uso con sus factories
    {
      provide: CreateOrderUseCase,
      useFactory: (orderRepo: PrismaOrderRepository, productRepo: PrismaCatalogProductRepository, publisher: OrderCreatedPublisher) => 
        new CreateOrderUseCase(orderRepo, productRepo, publisher),
      inject: [PrismaOrderRepository, PrismaCatalogProductRepository, OrderCreatedPublisher],
    },
    {
      provide: UpdateOrderStatusUseCase,
      useFactory: (repo: PrismaOrderRepository) => new UpdateOrderStatusUseCase(repo),
      inject: [PrismaOrderRepository],
    },
    // Consumidores
    {
      provide: ProductCreatedConsumer,
      useFactory: (repo: PrismaCatalogProductRepository) => new ProductCreatedConsumer(kafka, repo),
      inject: [PrismaCatalogProductRepository],
    },
    {
      provide: PaymentProcessedConsumer,
      useFactory: (useCase: UpdateOrderStatusUseCase) => new PaymentProcessedConsumer(kafka, useCase),
      inject: [UpdateOrderStatusUseCase],
    },
  ],
})
export class OrdersModule implements OnModuleInit {
  constructor(
    private readonly productConsumer: ProductCreatedConsumer,
    private readonly paymentConsumer: PaymentProcessedConsumer,
  ) {}

  async onModuleInit() {
  console.log('🚀 [Orders Service] Conectando consumidores...');
  // No uses Promise.all si sospechas que uno se cuelga, 
  // o asegúrate de que Kafka esté corriendo.
  this.productConsumer.run().catch(err => console.error("Error en Kafka:", err));
  this.paymentConsumer.run().catch(err => console.error("Error en Kafka:", err));
}
}