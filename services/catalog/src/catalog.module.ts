import { Module, OnModuleInit } from '@nestjs/common';
import { CatalogController } from './infrastructure/http/catalog.controller.js';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository.js';
import { ProductCreatedPublisher } from './infrastructure/product-created.publisher.js';
import { CompensateStockUseCase } from './application/compensate-stock.usecase.js';
import { DecreaseStockUseCase } from './application/decrease-stock.usecase.js';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { PaymentFailedConsumer } from './infrastructure/payment-failed.consumer.js';
import { kafka } from './infrastructure/kafka.client.js';
import { CreateProductUseCase } from './application/create-product.usecase.js';
import { SeedService } from './infrastructure/seed.service.js';
import { DeleteProductUseCase } from './application/delete-product.usecase.js';
import { UpdateProductUseCase } from './application/update-product.usecase.js';

@Module({
  controllers: [CatalogController],
  providers: [
    SeedService,
    // Repositorio
    PrismaProductRepository,
    // Publisher
    ProductCreatedPublisher,
    // Casos de Uso
    // En CatalogModule providers:
    {
      provide: CreateProductUseCase,
      useFactory: (repo: PrismaProductRepository, pub: ProductCreatedPublisher) => 
        new CreateProductUseCase(repo, pub),
      inject: [PrismaProductRepository, ProductCreatedPublisher],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (repo: PrismaProductRepository) => new UpdateProductUseCase(repo),
      inject: [PrismaProductRepository],
    },
    {
      provide: DeleteProductUseCase,
      useFactory: (repo: PrismaProductRepository) => new DeleteProductUseCase(repo),
      inject: [PrismaProductRepository],
    },
    {
      provide: DecreaseStockUseCase,
      useFactory: (repo: PrismaProductRepository, pub: ProductCreatedPublisher) => 
        new DecreaseStockUseCase(repo, pub),
      inject: [PrismaProductRepository, ProductCreatedPublisher],
    },
    {
      provide: CompensateStockUseCase,
      useFactory: (repo: PrismaProductRepository, pub: ProductCreatedPublisher) => 
        new CompensateStockUseCase(repo, pub),
      inject: [PrismaProductRepository, ProductCreatedPublisher],
    },
    // Consumidores (Los tratamos como providers)
    {
      provide: OrderCreatedConsumer,
      useFactory: (useCase: DecreaseStockUseCase) => new OrderCreatedConsumer(useCase),
      inject: [DecreaseStockUseCase],
    },
    {
      provide: PaymentFailedConsumer,
      useFactory: (useCase: CompensateStockUseCase) => new PaymentFailedConsumer(kafka, useCase),
      inject: [CompensateStockUseCase],
    },
    // Token para cumplir con tu arquitectura hexagonal
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepository,
    },
  ],
})
export class CatalogModule implements OnModuleInit {
  constructor(
    private readonly orderCreatedConsumer: OrderCreatedConsumer,
    private readonly paymentFailedConsumer: PaymentFailedConsumer,
  ) {}

  async onModuleInit() {
    // Esto sustituye al run() manual de tu script anterior
    console.log('🚀 [Catalog Service] Conectando consumidores de Kafka...');
    await Promise.all([
      this.orderCreatedConsumer.run(),
      this.paymentFailedConsumer.run(),
    ]);
  }
}