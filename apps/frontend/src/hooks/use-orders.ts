// apps/frontend/src/hooks/use-orders.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data;
    },
  });
};