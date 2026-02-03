'use client'
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/use-auth';
import { ShoppingBag, User, Gamepad2, LogOut, RefreshCw, LayoutDashboard } from 'lucide-react';
import { CartModal } from './cart-modal';
import Link from 'next/link';

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const { user, isAuthenticated, logout, checkTokenExpiration } = useAuthStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkTokenExpiration();
      const interval = setInterval(() => {
        checkTokenExpiration();
      }, 10000); 
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkTokenExpiration]);

  const handleOpenCart = () => {
    useAuthStore.persist.rehydrate();
    useAuthStore.getState().checkTokenExpiration();
    setIsCartOpen(true);
  }

  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Gamepad2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 uppercase">
              RETROVAULT
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {mounted && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    
                    {/* BOTÓN ADMIN: Estilo compacto y oscuro que pega con tu diseño */}
                    {isAuthenticated && user?.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-sm"
                      >
                        <LayoutDashboard size={16} />
                        Panel ADMIN
                      </Link>
                    )}

                    <div className="flex flex-col items-end leading-none">
                      <span className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${isAuthenticated ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {isAuthenticated ? 'Sesión Activa' : 'Sesión Expirada'}
                      </span>
                      <p className={`text-sm font-bold whitespace-nowrap ${isAuthenticated ? 'text-slate-900' : 'text-slate-400'}`}>
                        Hola, {user?.name}
                      </p>
                    </div>

                    {!isAuthenticated && (
                      <Link 
                        href="/login" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-black hover:bg-amber-100 transition-all animate-pulse"
                      >
                        <RefreshCw size={12} />
                        ENTRAR
                      </Link>
                    )}

                    {isAuthenticated && (
                      <Link href="/orders" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest hidden md:block border-l border-slate-200 pl-4 ml-1">
                        Mis Pedidos
                      </Link>
                    )}

                    <button 
                      onClick={() => logout()}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Cerrar Sesión"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 transition-all font-bold text-sm"
                  >
                    <User size={20} />
                    <span>Entrar</span>
                  </Link>
                )}
              </>
            )}

            <div className="h-6 w-px bg-slate-200 mx-2" />
            
            <button 
              onClick={ handleOpenCart } 
              className="relative p-2 text-slate-600 hover:text-indigo-600 transition group"
            >
              <ShoppingBag size={24} />
              {count > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white animate-in zoom-in">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};