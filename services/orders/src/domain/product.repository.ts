import { CatalogProduct } from './catalog-product.entity.js';
export interface ProductRepository {
  save(product: CatalogProduct): Promise<void>;
  findById(id: string): Promise<CatalogProduct | null>;
}