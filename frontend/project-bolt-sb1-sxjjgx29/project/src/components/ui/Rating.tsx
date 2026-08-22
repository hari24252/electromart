import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export function Rating({ value, count, size = 'sm', interactive, onChange, showValue, className }: RatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={cn(
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= Math.round(value)
                  ? 'fill-accent-400 text-accent-400'
                  : 'fill-paper-300 text-ink-300',
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-ink-700">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-ink-500">({count})</span>
      )}
    </div>
  );
}
