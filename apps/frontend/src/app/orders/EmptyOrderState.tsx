import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const EmptyOrdersState = () => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center animate-in fade-in zoom-in duration-500">
    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
      <ShoppingBag size={40} className="text-slate-300" />
    </div>
    <p className="text-slate-400 font-bold text-xl mb-8">
      Aún no has rescatado ningún juego...
    </p>
    <Link 
      href="/" 
      className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
    >
      IR AL CATÁLOGO <ArrowRight size={20} />
    </Link>
  </div>
);