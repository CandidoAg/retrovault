import { create } from 'zustand';
import { Product, CartItem } from '@/app/page';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  decreaseItem: (product: Product) => void;
  removeItem: (id: string) => void; 
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) return state;

      return {
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),

  decreaseItem: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);

    if (!existingItem) return state;

    if (existingItem.quantity === 1) {
      return { items: state.items.filter((item) => item.id !== product.id) };
    }

    return {
      items: state.items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      ),
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),

  clearCart: () => set({ items: [] }),
}));