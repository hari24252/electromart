import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Zap, Eye, Scale, Check } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency, getDiscountPercent, getEffectivePrice, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useDataStore } from '@/stores/dataStore';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductCard({ product, variant = 'default', className }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) => s.productIds.includes(product._id));
  const { toggleCompare, isInCompare } = useDataStore();

  const productId = product._id;
  const inCompare = isInCompare(productId);
  const discount = getDiscountPercent(product.price, product.discountPrice);
  const effectivePrice = getEffectivePrice(product);
  const isOutOfStock = product.stock === 0 || product.status === 'out-of-stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product, 1);
      openCart();
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name;

  return (
    <>
      <Link
        to={`/product/${product.slug}`}
        className={cn(
          'block glass-card group relative overflow-hidden transition-all duration-300',
          variant === 'featured' && 'border-brand-500/40 shadow-glow-blue',
          className
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-slate-950/60 rounded-t-2xl">
          <ProductImagePlaceholder
            src={product.images?.[0] || product.thumbnail}
            alt={product.name}
            category={categoryName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-extrabold text-[11px] rounded-full shadow-lg">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <Badge variant="accent" size="sm" className="bg-brand-500/90 text-white border-none">
                <Zap className="w-3 h-3 fill-current" /> Featured
              </Badge>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 bg-rose-500/80 text-white font-bold text-[10px] rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Icons (Wishlist & Compare) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-10">
            <button
              onClick={handleWishlist}
              title="Add to Wishlist"
              className={cn(
                'p-2 rounded-xl backdrop-blur-md transition-all shadow-md',
                isInWishlist
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/80 hover:bg-slate-800'
              )}
            >
              <Heart className={cn('w-4 h-4', isInWishlist && 'fill-current')} />
            </button>

            <button
              onClick={handleCompare}
              title="Compare Specifications"
              className={cn(
                'p-2 rounded-xl backdrop-blur-md transition-all shadow-md',
                inCompare
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/80 hover:bg-slate-800'
              )}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 glass-button py-2 text-xs font-semibold uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add
            </button>
            <button
              onClick={handleOpenQuickView}
              title="Quick View"
              className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
              {product.brand}
            </span>
            {categoryName && (
              <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                {categoryName}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[2.5rem] group-hover:text-brand-300 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 pt-1">
            <Rating value={product.ratingsAvg ?? 4.5} size="sm" />
            <span className="text-[11px] text-slate-400 font-mono">
              ({product.ratingsCount ?? 24})
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-white">{formatCurrency(effectivePrice)}</span>
              {discount > 0 && (
                <span className="text-xs text-slate-500 line-through">{formatCurrency(product.price)}</span>
              )}
            </div>
            {inCompare && (
              <span className="text-[10px] text-brand-400 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Comparing
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}

