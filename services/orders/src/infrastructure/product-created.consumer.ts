import { Kafka } from 'kafkajs';
import { ProductRepository } from '../domain/product.repository.js';
import { CatalogProduct } from '../domain/catalog-product.entity.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductCreatedConsumer {
  private consumer;

  constructor(private kafka: Kafka, private productRepo: ProductRepository) {
    this.consumer = this.kafka.consumer({ groupId: 'orders-sync-group' });
  }

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: ['product-created'], fromBeginning: true });
    
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const data = JSON.parse(message.value.toString());
          // Creamos la entidad asegurándonos de que los tipos son correctos
          const product = new CatalogProduct(
            data.id, 
            data.name, 
            data.price, 
            data.stock,
            data.brand,
            data.description,
            data.rating
          );

          // El repositorio usará UPSERT internamente para no duplicar
          await this.productRepo.save(product);

          // LOGS DE SINCRONIZACIÓN DETALLADOS
          console.log(`
          📥 [SINCRO KAFKA -> ORDERS DB]
          ---------------------------------------
          📦 Producto: ${product.name}
          🆔 ID:       ${product.id}
          📉 Stock:    ${product.stock}
          ---------------------------------------
          `);

        } catch (error) {
          console.error('❌ Error procesando mensaje de producto:', error);
        }
      }
    });
  }
}