import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Asegúrate de que esta ruta es correcta
import { useCartStore } from '@/store/cart-store';

export const useCreateOrder = () => {
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async (payload: { user: any; items: any[] }) => {
      const { user, items } = payload;

      // 1. Crear la Orden (Microservicio de Orders)
      const orderRes = await api.post('/orders', {
        customerId: user.id,
        customerName: user.name,
        items: items.map(i => ({ id: i.id, quantity: i.quantity }))
      });

      const createdOrder = orderRes.data.order;
      const totalAmount = createdOrder.total || items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

      // 2. Crear la sesión de Stripe (Microservicio de Payments)
      const paymentRes = await api.post('/payments/checkout', {
        orderId: createdOrder.id,
        amount: totalAmount,
        customerName: user.name,
        items: items.map(i => ({ 
          name: i.name, 
          price: i.price, 
          quantity: i.quantity 
        }))
      });

      return paymentRes.data; // Contiene la checkoutUrl
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al procesar el pedido';
      alert(msg);
    }
  });
};