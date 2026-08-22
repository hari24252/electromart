import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact';
  className?: string;
}

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export function ProductGrid({ products, columns = 4, variant = 'default', className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-xl font-bold uppercase tracking-tight text-ink-300 mb-2">No Products Found</p>
        <p className="text-sm text-ink-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3', columnClasses[columns], className)}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} variant={variant} />
      ))}
    </div>
  );
}
