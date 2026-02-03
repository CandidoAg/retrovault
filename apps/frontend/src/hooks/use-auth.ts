import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/use-auth';

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; passwordPlain: string }) => {
      const response = await api.post('/auth/register', data);
      return response.data; 
    },
  });
};

export const useLogin = () => {
  const loginStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (data: { email: string; passwordPlain: string }) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (userData) => {
      loginStore(userData);
    },
  });
};