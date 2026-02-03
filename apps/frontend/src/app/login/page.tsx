'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { mutate: login, isPending } = useLogin();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    login(
      { email, passwordPlain: password },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (error: any) => {
          setErrorMsg(error.response?.data?.message || 'Credenciales inválidas');
        },
      }
    );
  };

  useEffect(() => {
    if (isPending) setErrorMsg(null);
  }, [isPending]);

  // Si ya está autenticado, no renderizamos el formulario para evitar flashes
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">RETROVAULT</h1>
          <p className="text-slate-500 font-medium mt-2">Inicia sesión para completar tu pedido</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-900"
              placeholder="nintendo@retro.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm"
          >
            {isPending ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            ¿Eres nuevo? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Crea una cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}