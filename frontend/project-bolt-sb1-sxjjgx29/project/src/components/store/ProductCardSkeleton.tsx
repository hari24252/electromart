import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductCardSkeleton({ variant = 'default', className }: ProductCardSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('animate-pulse overflow-hidden rounded-xl border border-paper-200 bg-white p-3', className)}>
        <div className="aspect-square rounded-lg bg-paper-200 mb-3" />
        <div className="h-2.5 bg-paper-200 rounded mb-1.5 w-1/3" />
        <div className="h-3.5 bg-paper-100 rounded mb-1 w-full" />
        <div className="h-3.5 bg-paper-100 rounded mb-3 w-4/5" />
        <div className="h-4 bg-paper-200 rounded w-1/3" />
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={cn('animate-pulse overflow-hidden rounded-xl border border-paper-200 bg-white', className)}>
        <div className="aspect-square bg-paper-200" />
        <div className="p-4 space-y-3">
          <div className="h-2.5 bg-paper-200 rounded w-1/4" />
          <div className="h-4 bg-paper-100 rounded w-full" />
          <div className="h-4 bg-paper-100 rounded w-5/6" />
          <div className="h-3 bg-paper-200 rounded w-1/2" />
          <div className="h-4 bg-paper-200 rounded w-1/3 mt-2" />
          <div className="h-9 bg-paper-200 rounded-lg w-full mt-3" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('animate-pulse overflow-hidden rounded-xl border border-paper-200 bg-white', className)}>
      <div className="aspect-square bg-paper-200" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-paper-200 rounded w-1/4" />
        <div className="h-3.5 bg-paper-100 rounded w-full" />
        <div className="h-3.5 bg-paper-100 rounded w-3/4" />
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 w-3 rounded-sm bg-paper-200" />)}
        </div>
        <div className="border-t border-paper-200 pt-3 flex items-end justify-between">
          <div className="h-5 bg-paper-200 rounded w-1/3" />
        </div>
        <div className="h-9 bg-paper-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

export function ProductRowSkeleton({ count = 6, variant = 'compact' }: { count?: number; variant?: 'default' | 'compact' | 'featured' }) {
  const cols =
    variant === 'featured'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
  return (
    <div className={`grid gap-3 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
