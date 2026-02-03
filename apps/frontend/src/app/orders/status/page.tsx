'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle, Package, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-slate-300" size={64} />
      <span className="font-black italic uppercase text-slate-400 animate-pulse tracking-widest">Cargando...</span>
    </div>
  );
}

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('orderId');
  const cancelStatus = searchParams.get('status');
  const hasNotifiedCancel = useRef(false);

  const [status, setStatus] = useState<'PROCESSING' | 'PAID' | 'FAILED'>(
    cancelStatus === 'cancelled' ? 'FAILED' : 'PROCESSING'
  );

  useEffect(() => {
    // 1. Protección contra valores nulos o renders accidentales
    if (!orderId) return;

    // 2. Manejo de Cancelación Manual
    if (cancelStatus === 'cancelled') {
      setStatus('FAILED');
      
      if (!hasNotifiedCancel.current) {
        hasNotifiedCancel.current = true;
        
        // Usamos una función asíncrona interna para manejar errores del fetch
        const notifyBackend = async () => {
          try {
            const response = await fetch('http://localhost:3003/webhooks/cancel-manually', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId }),
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            console.log('[Payment] Cancelación manual notificada con éxito');
          } catch (err) {
            console.error('[Payment] Error al notificar cancelación:', err);
          }
        };

        notifyBackend();
      }
      return; 
    }

    // 3. Manejo de Socket (Solo si no es cancelación)
    let socket: any;
    try {
      socket = io('http://localhost:3003', { 
        query: { orderId },
        transports: ['websocket'] // Recomendado para evitar problemas de CORS/Polling
      });

      socket.on('order_status_changed', (data: { status: string }) => {
        if (data.status === 'PAID') setStatus('PAID');
        if (data.status === 'FAILED') setStatus('FAILED');
      });

      socket.on('connect_error', (err: any) => {
        console.error('[Socket] Error de conexión:', err);
      });

    } catch (err) {
      console.error('[Socket] Error al inicializar:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [orderId, cancelStatus]);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="text-red-500" size={64} />
        <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Pedido no encontrado</h1>
        <button onClick={() => router.push('/')} className="text-indigo-600 font-black underline italic uppercase">Volver a la tienda</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-in fade-in duration-700">
      <div className="flex justify-center mb-8">
        {status === 'PROCESSING' && (
          <div className="bg-indigo-100 p-6 rounded-full animate-pulse">
            <Loader2 className="text-indigo-600 animate-spin" size={48} />
          </div>
        )}
        {status === 'PAID' && (
          <div className="bg-emerald-100 p-6 rounded-full shadow-lg shadow-emerald-200 animate-in zoom-in">
            <CheckCircle2 className="text-emerald-600" size={48} />
          </div>
        )}
        {status === 'FAILED' && (
          <div className="bg-red-100 p-6 rounded-full shadow-lg shadow-red-100 animate-in zoom-in">
            <XCircle className="text-red-600" size={48} />
          </div>
        )}
      </div>

      <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase mb-4 leading-none">
        {status === 'PROCESSING' && 'Verificando Pago'}
        {status === 'PAID' && '¡Pago Confirmado!'}
        {status === 'FAILED' && (cancelStatus === 'cancelled' ? 'Pago Cancelado' : 'Error en el Pago')}
      </h1>

      <p className="text-slate-500 font-medium text-lg mb-12 max-w-md mx-auto leading-relaxed">
        {status === 'PROCESSING' && 'Estamos esperando la señal de Stripe. No cierres esta ventana...'}
        {status === 'PAID' && `¡Excelente! El pedido #${orderId.slice(0, 8)} está en camino.`}
        {status === 'FAILED' && (cancelStatus === 'cancelled' 
          ? 'Has cancelado el pago. El stock ha sido liberado.' 
          : 'Hubo un problema con la transacción.')}
      </p>

      <div className="flex flex-col gap-4 items-center">
        {status === 'PAID' ? (
          <button onClick={() => router.push('/orders')} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all uppercase italic">
            <Package size={22} /> Ver mis pedidos
          </button>
        ) : (
          <button onClick={() => router.push('/')} className="flex items-center gap-3 bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase italic">
            <ArrowLeft size={22} /> Volver a la tienda
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderStatusContent />
    </Suspense>
  );
}