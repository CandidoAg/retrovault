'use client'
import { ShoppingCart, Gamepad2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { Product } from '@/app/page';
import { useCartStore } from '@/store/cart-store';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-32px p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full cursor-pointer active:scale-[0.98]"
    >
      <div className="relative aspect-square bg-slate-50 rounded-24px mb-5 flex items-center justify-center overflow-hidden border border-slate-50">
        <Gamepad2 size={48} className="text-slate-200 group-hover:scale-110 group-hover:text-indigo-200 transition-all duration-500" />
        <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-md text-[10px] font-black text-slate-500 rounded-lg border border-white">
          {product.year}
        </span>
      </div>

      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">{product.brand}</span>
        <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
        
        <div className="mb-4">
          <StarRating rating={product.rating ?? 0} />
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Precio</span>
            <span className="text-xl font-black text-slate-900">{product.price.toFixed(2)}€</span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-md shadow-slate-200 active:scale-90"
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}