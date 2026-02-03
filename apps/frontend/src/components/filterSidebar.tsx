import { FilterState } from '@/app/page';
import { Search, Star } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  brands: string[];
}

export function FilterSidebar({ filters, setFilters, brands }: FilterSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8 sticky top-24">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Buscar</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Ej: Mario..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={filters.name}
            onChange={(e) => setFilters({...filters, name: e.target.value})}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Marca</h3>
        <select 
          className="w-full p-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-600"
          value={filters.brand}
          onChange={(e) => setFilters({...filters, brand: e.target.value})}
        >
          <option value="">Todas las marcas</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
          Rango de Precio
        </h3>
        
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[filters.minPrice, filters.maxPrice]}
          max={filters.maxPrice}
          step={10}
          onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
        >
          <Slider.Track className="bg-slate-200 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-indigo-600 grow rounded-full h-full" />
          </Slider.Track>
          
          <Slider.Thumb 
            className="block w-5 h-5 bg-white border-2 border-indigo-500 shadow-lg rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-indigo-500/20" 
            aria-label="Mínimo"
          />
          
          <Slider.Thumb 
            className="block w-5 h-5 bg-white border-2 border-indigo-500 shadow-lg rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-indigo-500/20" 
            aria-label="Máximo"
          />
        </Slider.Root>

        <div className="flex justify-between mt-4">
          <div className="text-xs font-bold text-indigo-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            ${filters.minPrice}
          </div>
          <div className="text-xs font-bold text-indigo-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            ${filters.maxPrice}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Valoración Mínima</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setFilters({...filters, minRating: star})}
              className={`p-1 transition-colors ${filters.minRating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
            >
              <Star size={20} fill={filters.minRating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}