import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../domain/product.repository.js';
import { ProductCreatedPublisher } from '../infrastructure/product-created.publisher.js';

@Injectable()
export class DecreaseStockUseCase {
  constructor(
    private productRepo: ProductRepository,
    private eventPublisher: ProductCreatedPublisher
  ) {}

  async execute(productId: string, quantity: number) {
    console.log(`🔍 Intentando descontar stock de ID: ${productId}`);

    const product = await this.productRepo.findById(productId);
    
    if (!product) {
      console.error(`❌ ERROR: Producto con ID ${productId} no existe en Catalog.`);
      return; 
    }

    product.stock -= quantity;
    await this.productRepo.save(product);
    
    console.log(`📉 Stock actualizado: ${product.name} ahora tiene ${product.stock}`);
    await this.eventPublisher.publish(product);
  }
}