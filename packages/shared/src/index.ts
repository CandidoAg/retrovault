export type ItemStatus = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'FAIR';
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export interface RetroProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export const isRetroYear = (year: number): boolean => {
  return year >= 1970 && year <= 2010;
};

export const Events = {
  PRODUCT_CREATED: 'product.created',
  STOCK_UPDATED: 'stock.updated',
} as const;

// Cómo luce la "carta" que enviará el catálogo
export interface ProductCreatedEvent {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export * from './events/order-created.schema.js';
export * from './events/payment-failed.schema.js';
export * from './events/payment-completed.schema.js';

export * from './test-utils.js';