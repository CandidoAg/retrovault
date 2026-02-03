'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth';
import { useProducts } from '@/hooks/use-products';
import { useAdmin } from '@/hooks/use-admin';
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Edit3, 
  PackageSearch, 
  Loader2,
  X
} from 'lucide-react';
import { AdminProductModal } from '@/components/admin-product-modal';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { createProduct, updateProduct, deleteProduct } = useAdmin();

  // Estados para UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Protección de ruta
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  // Handlers de acciones
  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Mandar "${name}" al olvido? Esta acción es definitiva.`)) {
      deleteProduct.mutate(id);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-4 rounded-[22px] shadow-2xl shadow-indigo-100">
              <LayoutDashboard className="text-indigo-400" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">La Bóveda</h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Gestión Maestra de Inventario</p>
            </div>
          </div>
          
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> Añadir Producto
          </button>
        </header>

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info Producto</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado Stock</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Precio Unitario</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productsLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={40} />
                  </td>
                </tr>
              ) : (
                products?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <PackageSearch size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{product.name}</p>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{product.brand} · {product.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {product.stock} Unidades
                        </span>
                        {product.stock === 0 && <span className="text-[9px] text-red-400 font-bold uppercase italic ml-1">Agotado</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 text-lg tracking-tighter">{product.price}€</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Editar Producto"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteProduct.isPending}
                          className="p-3 text-slate-600 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all disabled:opacity-30"
                          title="Eliminar de Bóveda"
                        >
                          {deleteProduct.isPending && deleteProduct.variables === product.id ? (
                             <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminProductModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          product={editingProduct} 
      />
    </div>
  );
}