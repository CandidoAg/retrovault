'use client';

import { useMyOrders } from '@/hooks/use-orders';
import { Package } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyOrdersState } from './EmptyOrderState';

export default function OrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) return <LoadingSpinner />; 

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex items-center gap-4 mb-10">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
          <Package className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Mis Pedidos</h1>
          <p className="text-slate-500 font-medium text-lg">Historial de adquisiciones</p>
        </div>
      </header>

      {!orders || orders.length === 0 ? (
        <EmptyOrdersState />
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}