import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../domain/product.repository.js';
import { ProductCreatedPublisher } from '../infrastructure/product-created.publisher.js';

export interface CompensateStockInput {
  items: { id: string, quantity: number }[];
}

@Injectable()
export class CompensateStockUseCase {
  constructor(private readonly productRepository: ProductRepository, private readonly eventPublisher: ProductCreatedPublisher) {}

  async execute(input: CompensateStockInput): Promise<void> {
    for (const item of input.items) {
      const product = await this.productRepository.findById(item.id);
      if (product) {
        console.log(`[Catalog] 🔄 Compensating stock for product ${product.id}: +${item.quantity}`);
        product.stock += item.quantity; // Sumamos de vuelta
        await this.productRepository.save(product);

        await this.eventPublisher.publish(product);
        console.log(`[Catalog] 📢 Sent compensation sync for ${product.name}`);
      }
    }
  }
}