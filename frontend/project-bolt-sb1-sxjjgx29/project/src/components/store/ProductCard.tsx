import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency, getDiscountPercent, getEffectivePrice, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useDataStore } from '@/stores/dataStore';
import { Rating } from '@/components/ui/Rating';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductCard({ product, variant = 'default', className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isInWishlist = useWishlistStore((state) => state.productIds.includes(product._id));
  const { toggleCompare, isInCompare } = useDataStore();
  const [isAdding, setIsAdding] = useState(false);

  const discount = getDiscountPercent(product.price, product.discountPrice);
  const effectivePrice = getEffectivePrice(product);
  const isOutOfStock = product.stock === 0 || product.status === 'out-of-stock';
  const inCompare = isInCompare(product._id);
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    addItem(product, 1);
    openCart();
    window.setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <article className={cn(
      'group overflow-hidden rounded-xl border border-paper-300 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-paper-400 hover:shadow-glass-lg',
      variant === 'featured' && 'border-brand-200',
      className,
    )}>
      <div className="relative border-b border-paper-200 bg-paper-100">
        <Link to={`/product/${product.slug}`} className="block aspect-square overflow-hidden bg-paper-100">
          <ProductImagePlaceholder
            src={product.images?.[0] || product.thumbnail}
            alt={product.name}
            category={categoryName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 && <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">{discount}% off</span>}
          {isOutOfStock && <span className="rounded-full bg-ink-800 px-2.5 py-1 text-[11px] font-medium text-white">Out of stock</span>}
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product._id)}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn('rounded-full border p-2 transition-colors', isInWishlist ? 'border-brand-500 bg-brand-500 text-white' : 'border-paper-300 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-600')}
          >
            <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product)}
            aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
            className={cn('rounded-full border p-2 transition-colors', inCompare ? 'border-teal-500 bg-teal-500 text-white' : 'border-paper-300 bg-white text-ink-600 hover:border-teal-200 hover:text-teal-700')}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-ink-500">{product.brand}</p>
        <Link to={`/product/${product.slug}`} className="mt-1 block text-sm font-semibold leading-5 text-ink-900 hover:text-brand-600">
          <span className="line-clamp-2 min-h-10">{product.name}</span>
        </Link>
        <div className="mt-2 flex items-center gap-1.5">
          <Rating value={product.ratingsAvg ?? 4.5} size="sm" />
          <span className="text-xs text-ink-500">{product.ratingsCount ?? 0}</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-paper-200 pt-3">
          <div>
            <p className="text-base font-bold text-ink-900">{formatCurrency(effectivePrice)}</p>
            {discount > 0 && <p className="mt-0.5 text-xs text-ink-400 line-through">{formatCurrency(product.price)}</p>}
          </div>
          {inCompare && <span className="flex items-center gap-1 text-xs font-medium text-teal-700"><Check className="h-3.5 w-3.5" /> Comparing</span>}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-paper-300 disabled:text-ink-500"
        >
          <ShoppingBag className="h-4 w-4" /> {isAdding ? 'Added to cart' : isOutOfStock ? 'Unavailable' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
