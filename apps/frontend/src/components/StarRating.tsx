import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
}

export function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5" title={`Valoración: ${rating}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => {
          const fillLevel = Math.max(0, Math.min(1, rating - (index - 1)));

          return (
            <div key={index} className="relative">
              <Star size={16} className="text-slate-200" fill="currentColor" />
                <div className="absolute top-0 left-0 overflow-hidden text-yellow-400" style={{ width: `${fillLevel * 100}%` }}>
                <Star size={16} className="fill-current" />
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-xs font-black text-slate-500 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}