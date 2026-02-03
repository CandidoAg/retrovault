import { Gamepad2 } from 'lucide-react';

export const OrderItemRow = ({ item }: { item: any }) => (
  <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
    {/* Icono con badge de cantidad */}
    <div className="relative">
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm group-hover:border-indigo-200">
        <Gamepad2 className="text-indigo-500" size={20} />
      </div>
      <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
        {item.quantity}
      </span>
    </div>

    {/* Info del Producto */}
    <div className="grow">
      <h4 className="font-bold text-slate-800 text-sm leading-tight">
        {item.name || 'Producto Retro'}
      </h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
        Ref: {item.id.slice(0, 6)}
      </p>
    </div>

    {/* Desglose de Precios */}
    <div className="text-right flex flex-col justify-center">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">
        Subtotal
      </span>
      <span className="font-black text-slate-900 text-lg tracking-tighter">
        {(item.price * item.quantity).toFixed(2)}<span className="text-sm ml-0.5 text-indigo-500">€</span>
      </span>
    </div>
  </div>
);