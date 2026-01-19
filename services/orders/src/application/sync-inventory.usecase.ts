import { ProductRepository } from '../domain/product.repository.js';
import { CatalogProduct } from '../domain/catalog-product.entity.js';

export class SyncInventoryUseCase {
  constructor(private productRepo: ProductRepository) {}

  async execute(data: { id: string, name: string, price: number, stock: number }) {
    const product = new CatalogProduct(data.id, data.name, data.price, data.stock);
    await this.productRepo.save(product);
    console.log(`📦 [Orders] Producto ${product.id} sincronizado en DB local.`);
  }
}