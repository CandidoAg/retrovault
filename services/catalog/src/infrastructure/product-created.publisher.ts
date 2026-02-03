import { kafka } from './kafka.client.js';
import { Product } from '../domain/product.entity.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductCreatedPublisher {
  // Usamos el productor de la instancia centralizada
  private producer = kafka.producer();

  async publish(product: Product) {
    await this.producer.connect();
    
    const messagePayload = {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      year: product.year,
      brand: product.brand,
      description: product.description,
      rating: product.rating
    };

    await this.producer.send({
      topic: 'product-created',
      messages: [{ value: JSON.stringify(messagePayload) }]
    });

    console.log(`📢 [Catalog] Evento de stock enviado: ${product.name} (Nuevo Stock: ${product.stock})`);
  }
}