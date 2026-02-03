import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (response: any) => void;
  logout: () => void;
  expireSession: () => void;
  checkTokenExpiration: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (response) => {
        try {
          const token = response.token;
          const decoded: any = jwtDecode(token);
          set({
            token,
            isAuthenticated: true,
            user: { id: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role },
          });
        } catch (error) {
          console.error('Error login:', error);
        }
      },
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      
      expireSession: () => set({ token: null, isAuthenticated: false }),

      checkTokenExpiration: () => {
        const { token, isAuthenticated, expireSession } = get();
        const storageValue = localStorage.getItem('auth-storage');
        
        if (!storageValue && isAuthenticated) {
          console.log('Detectado borrado manual de storage');
          expireSession();
          return;
        }

        if (!token) return;

        try {
          const decoded: any = jwtDecode(token);
          if (decoded.exp < Date.now() / 1000) {
            expireSession();
          }
        } catch {
          get().logout();
        }
      }
    }),
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => ( state ) => {
        state?.checkTokenExpiration();
      }
    }
  )
);