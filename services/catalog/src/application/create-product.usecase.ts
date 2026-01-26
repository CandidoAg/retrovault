// services/catalog/src/application/create-product.usecase.ts
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../domain/product.entity.js';
import { ProductRepository } from '../domain/product.repository.js';
import { ProductCreatedPublisher } from '../infrastructure/product-created.publisher.js';

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventPublisher: ProductCreatedPublisher
  ) {}

  async execute(data: { name: string; price: number; stock: number; year: number }): Promise<Product> {
    const product = new Product(uuidv4(), data.name, data.price, data.stock, data.year);

    await this.productRepository.save(product);

    console.log(`[Catalog] 📢 Publicando evento de creación para: ${product.name}`);
    await this.eventPublisher.publish(product);

    return product;
  }
}