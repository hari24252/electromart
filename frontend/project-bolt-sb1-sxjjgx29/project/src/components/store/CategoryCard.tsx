import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'large';
  className?: string;
}

export function CategoryCard({ category, variant = 'default', className }: CategoryCardProps) {
  if (variant === 'large') {
    return (
      <Link
        to={`/catalog?category=${category.slug}`}
        className={cn('block relative overflow-hidden glass-card group', className)}
      >
        <div className="aspect-[4/3] overflow-hidden bg-slate-950/60">
          <ProductImagePlaceholder
            src={category.image}
            alt={category.name}
            category={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-xl font-bold font-display">{category.name}</h3>
          <p className="text-xs text-slate-400">{category.productCount || 12} Products Available</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand-400">
            Explore Category <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/catalog?category=${category.slug}`}
      className={cn('block glass-card group p-3 text-center space-y-3', className)}
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800">
        <ProductImagePlaceholder
          src={category.image}
          alt={category.name}
          category={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div>
        <h3 className="text-xs font-bold font-display text-white group-hover:text-brand-300 transition-colors">
          {category.name}
        </h3>
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{category.productCount || 12} Items</p>
      </div>
    </Link>
  );
}

