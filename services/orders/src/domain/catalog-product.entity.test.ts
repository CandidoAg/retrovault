import { describe, it, expect } from 'vitest';
import { CatalogProduct } from './catalog-product.entity.js';

describe('CatalogProduct Entity (Read Model in Orders)', () => {
  it('should instantiate correctly with provided values', () => {
    const product = new CatalogProduct('prod-999', 'Sega Genesis', 150.5, 10, 'Sega');
    
    expect(product.id).toBe('prod-999');
    expect(product.name).toBe('Sega Genesis');
    expect(product.price).toBe(150.5);
    expect(product.stock).toBe(10);
  });
});