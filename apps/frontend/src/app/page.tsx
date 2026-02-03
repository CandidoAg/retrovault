'use client'
import { useState } from 'react';
import { FilterSidebar } from '@/components/filterSidebar';
import { ProductCard } from '@/components/product-card';
import { ProductModal } from '@/components/product-modal';
import { useProducts } from '@/hooks/use-products';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  year: number;
  brand: string;
  description?: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FilterState {
  name: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
}

export default function HomePage() {
  const { data: products = [], isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({ 
    name: '', 
    brand: '', 
    minPrice: 0,
    maxPrice: 300, 
    minRating: 0
  });

  const availableBrands = Array.from(new Set(products.map((p: Product) => p.brand))) as string[];

  const filteredProducts = products.filter((p: Product) => {
    const matchesName = p.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesBrand = filters.brand === '' || p.brand === filters.brand;
    const matchesPrice = p.price >= filters.minPrice && (filters.maxPrice === 300 ? true : p.price <= filters.maxPrice);
    const matchesRating = (p.rating || 0) >= filters.minRating; 

    return matchesName && matchesBrand && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      <main className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col md:flex-row gap-10">
          <aside className="w-full md:w-72 shrink-0">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              brands={availableBrands} 
            />
          </aside>

          <section className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-[40px]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: Product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => setSelectedProduct(product)} 
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <p className="text-slate-300 font-black text-xl mb-4">No se encontró nada coincidente</p>
                    <button 
                      onClick={() => setFilters({ name: '', brand: '', minPrice: 0, maxPrice: 300, minRating: 0 })}
                      className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
                    >
                      Resetear Filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {selectedProduct && (
          <>
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-all duration-500"
              onClick={() => setSelectedProduct(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-2xl">
                <ProductModal 
                  product={selectedProduct} 
                  onClose={() => setSelectedProduct(null)} 
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}