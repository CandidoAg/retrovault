'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/hooks/use-auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    register(
      { 
        name: formData.name, 
        email: formData.email, 
        passwordPlain: formData.password 
      },
      {
        onSuccess: () => {
          // Tras registrarse con éxito, lo mandamos al login 
          // para que obtenga su token/sesión formalmente.
          router.push('/login');
        },
        onError: (error: any) => {
          // Captura el ConflictException de tu NestJS (ej: email ya existe)
          setErrorMsg(error.response?.data?.message || 'Error al crear la cuenta');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">ÚNETE A RETROVAULT</h1>
          <p className="text-slate-500 font-medium mt-2">Crea tu cuenta de coleccionista</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Nombre Real
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-900"
              placeholder="Link de Hyrule"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-900"
              placeholder="link@triforce.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm"
          >
            {isPending ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}