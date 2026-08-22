import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Minus, Plus, Truck, Shield, RotateCcw, Zap, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency, getDiscountPercent, getEffectivePrice, cn, clamp } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [showDesc, setShowDesc] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) => s.productIds.includes(product._id));
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const discount = getDiscountPercent(product.price, product.discountPrice);
  const effectivePrice = getEffectivePrice(product);
  const isOutOfStock = product.stock === 0 || product.status === 'out-of-stock';
  const savings = product.price - effectivePrice;

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand + name */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">{product.brand}</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
      </div>

      {/* Rating + SKU */}
      <div className="flex items-center gap-4 flex-wrap">
        <Rating value={product.ratingsAvg ?? 0} count={product.ratingsCount ?? 0} size="md" showValue />
        <span className="text-xs text-ink-400">SKU: {product.sku}</span>
      </div>

      {/* Price */}
      <div className="brutal-card p-4 bg-paper-100">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-bold">{formatCurrency(effectivePrice)}</span>
          {discount > 0 && (
            <>
              <span className="text-lg text-ink-400 line-through">{formatCurrency(product.price)}</span>
              <Badge variant="danger">{discount}% OFF</Badge>
            </>
          )}
        </div>
        {savings > 0 && (
          <p className="text-sm text-success-700 font-bold mt-1">You save {formatCurrency(savings)}</p>
        )}
        <p className="text-xs text-ink-500 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <Badge variant="danger">Out of Stock</Badge>
        ) : product.stock < 10 ? (
          <Badge variant="warning">Only {product.stock} left!</Badge>
        ) : (
          <Badge variant="success"><Check className="w-3 h-3" /> In Stock</Badge>
        )}
      </div>

      {/* Short description */}
      <p className="text-sm text-ink-600">{product.shortDescription}</p>

      {/* Quantity + Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide">Qty:</span>
          <div className="flex items-center brutal-border bg-white">
            <button
              onClick={() => setQuantity((q) => clamp(q - 1, 1, product.stock))}
              disabled={quantity <= 1}
              className="p-2 hover:bg-paper-100 transition-colors disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-bold border-x-2 border-ink-900 min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => clamp(q + 1, 1, product.stock))}
              disabled={quantity >= product.stock}
              className="p-2 hover:bg-paper-100 transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingBag className="w-5 h-5" /> Add to Cart
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            <Zap className="w-5 h-5" /> Buy Now
          </Button>
          <button
            onClick={() => toggleWishlist(product._id)}
            className={cn(
              'brutal-border p-3 transition-colors',
              isInWishlist ? 'bg-danger-500 text-white' : 'bg-white hover:bg-paper-100',
            )}
          >
            <Heart className={cn('w-5 h-5', isInWishlist && 'fill-current')} />
          </button>
        </div>
      </div>

      {/* Delivery + trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Truck, label: 'Free Delivery', sub: 'Orders ₹999+' },
          { icon: RotateCcw, label: '7-Day Returns', sub: 'Easy returns' },
          { icon: Shield, label: 'Warranty', sub: product.warranty.duration },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="brutal-border bg-white p-3 text-center">
              <Icon className="w-5 h-5 mx-auto mb-1 text-primary-600" />
              <p className="text-xs font-bold">{item.label}</p>
              <p className="text-2xs text-ink-500">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Box contents */}
      {product.whatsInTheBox.length > 0 && (
        <div className="brutal-border bg-white p-3">
          <button
            onClick={() => setShowDesc(!showDesc)}
            className="w-full flex items-center justify-between font-semibold text-sm uppercase tracking-wide"
          >
            What's in the Box
            {showDesc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showDesc && (
            <ul className="mt-2 space-y-1">
              {product.whatsInTheBox.map((item, i) => (
                <li key={i} className="text-sm text-ink-600 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-success-600" /> {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
