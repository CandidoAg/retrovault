import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (newProduct: any) => {
      const { data } = await api.post('/catalog', newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...changes }: { id: string; [key: string]: any }) => {
      const { data } = await api.patch(`/catalog/${id}`, changes);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/catalog/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return { 
    createProduct, 
    updateProduct, 
    deleteProduct 
  };
};