export type ItemStatus = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'FAIR';

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