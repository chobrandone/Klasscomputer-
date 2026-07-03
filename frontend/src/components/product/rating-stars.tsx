import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({
  rating,
  count,
  size = 'sm',
}: {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}) {
  const starSize = size === 'md' ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? 'fill-amber-500 text-amber-500'
                : 'fill-[#E0E0E0] text-[#E0E0E0] dark:fill-[#2A2A2A] dark:text-[#2A2A2A]',
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-[#999999]">({count})</span>
      )}
    </div>
  );
}
