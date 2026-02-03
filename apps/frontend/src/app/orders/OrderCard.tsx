'use client';
import { useState } from 'react';
import { ChevronDown, Calendar, Hash, Package, CreditCard, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { OrderItemRow } from './OrderItemRow';

// 1. Configuración de estados para una UI dinámica
const STATUS_CONFIG: Record<string, any> = {
  PAID: { 
    label: 'Pago Completado', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-100',
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    dotColor: 'bg-emerald-500'
  },
  PENDING: { 
    label: 'Esperando Pago', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-100',
    icon: <Clock size={14} className="text-amber-500" />,
    dotColor: 'bg-amber-500'
  },
  FAILED: { 
    label: 'Pago Fallido', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-100',
    icon: <AlertCircle size={14} className="text-red-500" />,
    dotColor: 'bg-red-500'
  },
  CANCELLED: { 
    label: 'Cancelado', 
    color: 'text-slate-500', 
    bgColor: 'bg-slate-100', 
    borderColor: 'border-slate-200',
    icon: <XCircle size={14} className="text-slate-400" />,
    dotColor: 'bg-slate-400'
  }
};

export const OrderCard = ({ order }: { order: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalCalculado = order.total ?? order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity) ,0);
  
  // Obtenemos la config según el estado (o uno por defecto)
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const isInactive = order.status === 'CANCELLED' || order.status === 'FAILED';

  return (
    <div className={`
      group bg-white border rounded-4xl overflow-hidden shadow-sm transition-all duration-500
      ${isOpen ? 'ring-2 ring-indigo-500/10' : 'hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)]'}
      ${isInactive ? 'opacity-85 border-slate-100' : 'border-slate-100'}
    `}>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 cursor-pointer flex flex-wrap justify-between items-center gap-4 hover:bg-slate-50/30 transition-colors"
      >
        <div className="flex items-center gap-8">
          {/* Bloque Fecha */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all duration-300 ${isOpen ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}>
              <Calendar className={`${isOpen ? 'text-white' : 'text-slate-400'}`} size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fecha del pedido</span>
              <p className="font-bold text-slate-900 leading-none mt-1">{order.createdAt || 'Sin fecha'}</p>
            </div>
          </div>
          
          {/* Bloque ID y Estado */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
               <Hash size={12} className="text-indigo-300" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Referencia</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="font-mono text-[11px] text-indigo-500 font-bold uppercase">
                #{order.id.slice(0, 8)}
              </p>
              {/* Badge de Estado en el Header */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${status.bgColor} ${status.borderColor}`}>
                <div className={`w-1 h-1 rounded-full ${status.dotColor}`} />
                <span className={`text-[9px] font-black uppercase tracking-tighter ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloque Total */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inversión</span>
            <p className={`text-3xl font-black tracking-tighter ${isInactive ? 'text-slate-400 line-through decoration-1' : 'text-slate-900'}`}>
              {totalCalculado.toFixed(2)}<span className="text-lg ml-0.5 text-indigo-600">€</span>
            </p>
          </div>
          
          <button
            className={`
              p-3 rounded-2xl transition-all duration-500 flex items-center justify-center
              ${isOpen 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 rotate-180' 
                : 'bg-slate-50 text-slate-400 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'}
            `}
          >
            <ChevronDown size={22} />
          </button>
        </div>
      </div>

      {/* Cuerpo Colapsable */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 space-y-4">
          <div className="w-full h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mb-6" />
          
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-indigo-400" /> 
              Desglose de productos
            </h5>
          </div>

          <div className="grid gap-3">
            {order.items.map((item: any, idx: number) => (
              <OrderItemRow key={idx} item={item} />
            ))}
          </div>

          {/* Footer del card expandido */}
          <div className="mt-6 pt-5 flex justify-between items-center border-t border-dashed border-slate-200">
             <div className="flex items-center gap-2">
                {/* Indicador de estado real */}
                <div className={`w-2 h-2 rounded-full ${status.dotColor} ${order.status === 'PENDING' ? 'animate-pulse' : ''}`} />
                <span className={`${status.color} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                  {status.icon}
                  {status.label}
                </span>
             </div>
             
             <div className="flex items-center gap-2 text-slate-400">
               <CreditCard size={14} className="text-slate-300" />
               <span className="text-[10px] font-bold uppercase tracking-tight">
                {order.status === 'PAID' ? 'Pago Verificado' : 'Seguridad SSL'}
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};