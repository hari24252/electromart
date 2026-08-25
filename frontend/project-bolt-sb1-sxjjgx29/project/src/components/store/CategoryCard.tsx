import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'wide';
  className?: string;
}

export function CategoryCard({ category, variant = 'default', className }: CategoryCardProps) {
  if (variant === 'wide') {
    return (
      <Link to={`/?category=${category.slug}`} className={cn('group flex items-center gap-4 rounded-xl border border-paper-300 bg-white p-3 transition-all hover:border-paper-400 hover:shadow-glass', className)}>
        <ProductImagePlaceholder src={category.image} alt={category.name} category={category.name} className="h-20 w-20 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink-900 group-hover:text-brand-600">{category.name}</h3>
          <p className="mt-1 text-xs text-ink-500">{category.productCount ?? 0} products</p>
        </div>
        <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-600" />
      </Link>
    );
  }

  return (
    <Link to={`/?category=${category.slug}`} className={cn('group block overflow-hidden rounded-xl border border-paper-300 bg-white transition-all hover:border-paper-400 hover:shadow-glass', className)}>
      <ProductImagePlaceholder src={category.image} alt={category.name} category={category.name} className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink-900 group-hover:text-brand-600">{category.name}</h3>
          <p className="mt-0.5 text-xs text-ink-500">{category.productCount ?? 0} products</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 group-hover:text-brand-600" />
      </div>
    </Link>
  );
}
