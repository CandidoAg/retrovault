'use client';

import { useState, useEffect } from 'react';
import { X, Save, Gamepad2, Star } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any; 
}

export function AdminProductModal({ isOpen, onClose, product }: AdminProductModalProps) {
  const { createProduct, updateProduct } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    year: new Date().getFullYear(),
    brand: '',
    description: '',
    rating: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        stock: product.stock || 0,
        year: product.year || 2024,
        brand: product.brand || '',
        description: product.description || '',
        rating: product.rating || 0
      });
    } else {
      setFormData({ name: '', price: 0, stock: 0, year: 2024, brand: '', description: '', rating: 0 });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      // Aseguramos tipos correctos para Prisma (Float e Int)
      price: Number(formData.price),
      stock: Number(formData.stock),
      year: Number(formData.year),
      rating: Number(formData.rating)
    };

    if (product) {
      updateProduct.mutate({ id: product.id, ...payload }, { onSuccess: onClose });
    } else {
      createProduct.mutate(payload, { onSuccess: onClose });
    }
  };

  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none";
  const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-[40px] shadow-2xl relative max-w-xl w-full max-h-[90vh] overflow-y-auto border border-white animate-in zoom-in duration-200"
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-8 pb-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
              <Gamepad2 className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pt-2 space-y-5">
          <div>
            <label className={labelStyle}>Nombre del Título</label>
            <input required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Silent Hill 2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Saga / Brand</label>
              <input required className={inputStyle} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Konami" />
            </div>
            <div>
              <label className={labelStyle}>Año de Lanzamiento</label>
              <input type="number" required className={inputStyle} value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelStyle}>Precio (€)</label>
              <input type="number" step="0.01" required className={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className={labelStyle}>Stock</label>
              <input type="number" required className={inputStyle} value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
            </div>
            <div>
                <label className={labelStyle}>Rating (0-5.0)</label>
                <div className="relative group/rating">
                    <input type="number" step="0.1" min="0" max="5" className={`${inputStyle} pr-12`} value={formData.rating} placeholder="4.5"
                    onChange={e => {
                        const val = e.target.value;
                        // Solo permitimos un decimal mediante regex o limitando el valor
                        if (/^\d?(\.\d{0,1})?$/.test(val) && Number(val) <= 5) {
                            setFormData({...formData, rating: val as any});
                        }
                    }} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <Star 
                        className="text-amber-400 group-focus-within/rating:scale-110 transition-transform" 
                        size={16} 
                        fill="currentColor" 
                    />
                    </div>
                </div>
                </div>
          </div>

          <div>
            <label className={labelStyle}>Descripción (Opcional)</label>
            <textarea rows={3} className={`${inputStyle} resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Escribe la historia de esta joya..." />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 group"
            >
              {createProduct.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
              <span className="uppercase tracking-[0.2em] text-xs">Guardar en la Base de Datos</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}