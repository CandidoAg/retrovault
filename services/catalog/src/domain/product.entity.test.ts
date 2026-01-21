import { describe, it, expect } from 'vitest';
import { Product } from './product.entity.js';

describe('Product Entity', () => {
  it('debería crear un producto con los valores correctos', () => {
    const product = new Product('1', 'Zelda NES', 50, 10, 1986);
    expect(product.name).toBe('Zelda NES');
    expect(product.stock).toBe(10);
  });

  it('debería validar si hay stock suficiente', () => {
    const product = new Product('1', 'Mario', 40, 5, 1985);
    expect(product.hasStock(3)).toBe(true);
    expect(product.hasStock(10)).toBe(false);
  });

  it('debería reducir el stock correctamente', () => {
    const product = new Product('1', 'Metroid', 30, 10, 1986);
    product.reduceStock(4);
    expect(product.stock).toBe(6);
  });

  it('debería lanzar error si no hay stock suficiente', () => {
    const product = new Product('1', 'Sonic', 20, 2, 1991);
    expect(() => product.reduceStock(5)).toThrow(/Stock insuficiente/i);
  });
});