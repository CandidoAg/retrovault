import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/catalog'); 
      return data;
    },
  });
};