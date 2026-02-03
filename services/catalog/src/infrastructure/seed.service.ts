import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Product } from '../domain/product.entity.js';
import { ProductRepository } from '@/domain/product.repository.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject('ProductRepository') private readonly productRepository: ProductRepository,
  ) {}

  async onModuleInit() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await this.runSeed();
  }

  private async runSeed() {
    const existingProducts = await this.productRepository.findAll();
    
    if (existingProducts.length > 0) {
      this.logger.log('🌱 Database already has products, skipping seed.');
      return;
    }

    this.logger.log('🌱 Database empty. Starting auto-seed...');

    const initialProductsData = [
      { id: crypto.randomUUID(), name: 'Metroid Dread', price: 59.99, stock: 1000, year: 2021, brand: 'Nintendo', description: 'Action-adventure game', rating: 5 },
      { id: crypto.randomUUID(), name: 'Castlevania: SoTN', price: 45.00, stock: 1000, year: 1997, brand: 'Konami', description: 'Masterpiece of the genre', rating: 5 },
      { id: crypto.randomUUID(), name: 'Zelda: Ocarina', price: 60.00, stock: 1000, year: 1998, brand: 'Nintendo', description: 'Legendary RPG', rating: 5 },
      { id: crypto.randomUUID(), name: 'Sonic Frontiers', price: 40.00, stock: 1000, year: 2022, brand: 'Sega', description: 'Open-zone platformer', rating: 4 },
      { id: crypto.randomUUID(), name: 'Final Fantasy VII', price: 30.00, stock: 1000, year: 1997, brand: 'Square Enix', description: 'Classic JRPG', rating: 5 },
    ];

    try {
      for (const product of initialProductsData) {
        const productEntity = new Product(product.id, product.name, product.price, product.stock, product.year, product.brand, product.description, product.rating);
        await this.productRepository.save(productEntity);
      }
      this.logger.log(`✅ Seed finished: ${initialProductsData.length} products created.`);    
    } catch (error: any) {
      this.logger.error('❌ Error during auto-seed:', error.message);
    }
  }
}