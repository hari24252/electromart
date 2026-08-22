import React from 'react';
import { X, Trash2, ShoppingBag, Star, CheckCircle, XCircle } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useCartStore } from '@/stores/cartStore';
import { ProductImagePlaceholder } from '../common/ProductImagePlaceholder';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({ isOpen, onClose }) => {
  const { compareProducts, toggleCompare, clearCompare } = useDataStore();
  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen || compareProducts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-scale-in">
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-glass-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-950/80 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              Side-by-Side Product Comparison
              <span className="text-xs font-mono bg-brand-600/20 text-brand-400 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                {compareProducts.length} / 4 Selected
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Compare specifications, prices, and features before purchasing</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto p-6 scrollbar-thin">
          <div className="min-w-[700px] grid grid-cols-5 gap-4 border-b border-slate-800 pb-4">
            {/* Spec Labels Column */}
            <div className="font-semibold text-xs text-slate-400 uppercase tracking-wider space-y-8 pt-4">
              <div>Product</div>
              <div>Price</div>
              <div>Rating</div>
              <div>Brand</div>
              <div>Category</div>
              <div>Availability</div>
              <div>Actions</div>
            </div>

            {/* Compared Product Columns */}
            {compareProducts.map((product) => (
              <div key={product._id} className="space-y-6 flex flex-col justify-between">
                {/* Image & Title */}
                <div className="relative group">
                  <button
                    onClick={() => toggleCompare(product)}
                    className="absolute top-2 right-2 z-10 p-1 bg-slate-900/80 rounded-full text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ProductImagePlaceholder
                    src={product.images?.[0] || product.thumbnail}
                    alt={product.name}
                    category={typeof product.category === 'string' ? product.category : product.category?.name}
                    className="w-full h-36 object-cover rounded-xl border border-slate-800"
                  />
                  <h3 className="text-sm font-bold text-white mt-2 line-clamp-2">{product.name}</h3>
                </div>

                {/* Price */}
                <div className="text-lg font-extrabold text-brand-400">${(product.discountPrice ?? product.price).toFixed(2)}</div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.ratingsAvg || 4.8}</span>
                </div>

                {/* Brand */}
                <div className="text-xs font-medium text-slate-300">{product.brand}</div>

                {/* Category */}
                <div className="text-xs text-slate-400">
                  {typeof product.category === 'string' ? product.category : product.category?.name || 'Electronics'}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-1 text-xs">
                  {product.stock > 0 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addItem(product, 1)}
                  className="w-full glass-button py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
