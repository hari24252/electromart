import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, Check, ShieldCheck, Truck } from 'lucide-react';
import type { Product } from '@/types';
import { ProductImagePlaceholder } from '../common/ProductImagePlaceholder';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggle, has } = useWishlistStore();

  if (!product) return null;

  const inWishlist = has(product._id);
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-scale-in">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-glass-lg overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="w-full md:w-1/2 p-6 bg-slate-950/50 flex flex-col justify-center items-center relative">
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-lg">
              SAVE {discountPercent}%
            </span>
          )}
          <ProductImagePlaceholder
            src={product.images?.[0] || product.thumbnail}
            alt={product.name}
            category={typeof product.category === 'string' ? product.category : product.category?.name}
            className="w-full h-80 object-cover rounded-xl border border-slate-800/80"
          />
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-wider text-brand-400 uppercase">
              {typeof product.category === 'string' ? product.category : product.category?.name || 'Electronics'}
            </span>
            <h2 className="text-2xl font-bold text-white font-display leading-tight">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.ratingsAvg || 4.5) ? 'fill-current' : 'text-slate-700'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {product.ratingsAvg || 4.8} ({product.ratingsCount || 34} reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-white">${(product.discountPrice ?? product.price).toFixed(2)}</span>
              {product.discountPrice && (
                <span className="text-lg line-through text-slate-500">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {product.shortDescription || 'High-performance next-generation hardware designed for maximum reliability and efficiency.'}
            </p>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-700 rounded-lg text-lg font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-700 rounded-lg text-lg font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 glass-button py-3 text-sm font-semibold tracking-wide"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> ADDED TO CART
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> ADD TO CART
                  </>
                )}
              </button>

              <button
                onClick={() => toggle(product._id)}
                className={`p-3 rounded-xl border transition-all ${
                  inWishlist
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-400" />
                <span>Express 2-Day Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2 Year Full Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
