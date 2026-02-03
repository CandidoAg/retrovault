import axios from 'axios';
import { useAuthStore } from '@/store/use-auth';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.token;

  if (state.isAuthenticated && !token) {
    state.expireSession(); 
    return Promise.reject(new Error("Sesión local perdida")); 
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isRegisterRequest = error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isLoginRequest && !isRegisterRequest) {
      const { expireSession, isAuthenticated } = useAuthStore.getState();
      
      if (isAuthenticated) {
        alert("Tu sesión ha expirado por seguridad.");
        expireSession();
      }
    }
    return Promise.reject(error);
  }
);