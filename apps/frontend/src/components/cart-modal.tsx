'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/use-auth';
import { useCreateOrder } from '@/hooks/use-create-order';
import { X, Plus, Minus, Trash2, ShoppingBasket, ShoppingBag, CreditCard, ArrowRight, ShieldAlert } from 'lucide-react';

export const CartModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const router = useRouter();
  
  const { items, addItem, decreaseItem, removeItem, clearCart } = useCartStore();
  const { user, isAuthenticated, checkTokenExpiration } = useAuthStore();
  
  const { mutate: createOrder, isPending } = useCreateOrder();
  
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    if (isOpen) {
      useAuthStore.persist.rehydrate();
      checkTokenExpiration();
    }
  }, [isOpen, checkTokenExpiration]);

  const handleAction = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=checkout');
      onClose();
      return;
    }

    if (!user) {
      alert("Debes estar identificado para comprar");
      return;
    }

    if (items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    createOrder({ 
      user: {
        id: user.id,
        name: user.name
      }, 
      items 
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Panel Lateral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ShoppingBasket className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">TU CARRITO</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 hover:rotate-90 duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="grow overflow-y-auto p-6 space-y-6 bg-white">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Tu baúl está vacío</p>
              <button 
                onClick={onClose} 
                className="mt-4 text-indigo-600 font-bold hover:text-indigo-700 flex items-center justify-center gap-2 w-full"
              >
                Volver al catálogo <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                <div className="grow">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.name}</h4>
                  <p className="text-indigo-600 font-black">{item.price.toFixed(2)}€</p>
                </div>
                
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button 
                    onClick={() => decreaseItem(item)} 
                    className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-black text-slate-900 w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => addItem(item)} 
                    className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => removeItem(item.id)} 
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer con Resumen y Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            
            {/* Aviso de Sesión (Estilo Amazon) */}
            {user && !isAuthenticated && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                <p className="text-[11px] font-bold text-amber-800 leading-tight uppercase tracking-tight">
                  Tu sesión ha caducado. Identifícate para finalizar tu compra de forma segura.
                </p>
              </div>
            )}

            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Resumen</span>
                <span className="text-slate-500 font-bold">Total a pagar</span>
              </div>
              <span className="font-black text-3xl text-slate-900 tracking-tighter">{total.toFixed(2)}€</span>
            </div>

            <button 
              onClick={handleAction}
              disabled={isPending}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none
                ${isAuthenticated 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100'}`}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>PROCESANDO...</span>
                </div>
              ) : (
                <>
                  {isAuthenticated ? <CreditCard size={20} /> : <ArrowRight size={20} />}
                  <span>{isAuthenticated ? 'FINALIZAR COMPRA' : 'IDENTIFÍCATE PARA PAGAR'}</span>
                </>
              )}
            </button>
            
            <button 
              onClick={clearCart}
              className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-red-500 font-bold text-xs transition-colors group tracking-widest"
            >
              <Trash2 size={14} />
              VACIAR CARRITO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};