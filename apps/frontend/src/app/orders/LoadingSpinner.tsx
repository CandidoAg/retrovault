export const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
    </div>
    <p className="text-indigo-600 font-black tracking-widest text-xs animate-pulse">
      CARGANDO TU BAÚL...
    </p>
  </div>
);