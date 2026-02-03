'use client'
import { X, ShoppingCart, Gamepad2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { Product } from '@/app/page';
import { useCartStore } from '@/store/cart-store';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="bg-white rounded-[48px] p-4 shadow-2xl relative max-w-2xl w-full mx-4 overflow-hidden border border-slate-50 animate-in fade-in zoom-in duration-300">
      
      <div className="w-full h-72 bg-slate-50 rounded-[40px] flex items-center justify-center border border-slate-100/50 relative group">
        <Gamepad2 size={80} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 bg-white/80 backdrop-blur-md text-slate-400 hover:text-slate-900 p-2.5 rounded-full shadow-sm border border-white/50 transition-all active:scale-90 z-20"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <div className="absolute bottom-6 left-6 flex gap-2">
          <span className="px-4 py-1.5 bg-white shadow-sm text-indigo-600 text-[10px] font-black uppercase rounded-2xl border border-slate-100">
            {product.brand}
          </span>
          <span className="px-4 py-1.5 bg-white shadow-sm text-slate-400 text-[10px] font-black uppercase rounded-2xl border border-slate-100">
            {product.year}
          </span>
        </div>
      </div>

      <div className="p-8 pt-10">
        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tighter">
          {product.name}
        </h2>

        <div className="mb-6">
          <StarRating rating={product.rating ?? 0} />
        </div>

        <p className="text-slate-500 leading-relaxed text-sm mb-12 max-w-[95%] font-medium">
          {product.description || "Un título legendario que definió una época. Imprescindible en cualquier colección retro."}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Precio</span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              {product.price.toFixed(2)}€
            </span>
          </div>
          
          <button 
            onClick={() => {
              addItem(product);
            }}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-10 py-4 rounded-[20px] font-black flex items-center gap-3 transition-all shadow-lg shadow-indigo-100 active:scale-95 group"
          >
            <ShoppingCart size={20} strokeWidth={2.5} className="group-hover:animate-pulse" />
            <span className="text-sm tracking-wide uppercase">Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}