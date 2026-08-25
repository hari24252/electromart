import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { CouponInput } from '@/components/store/CouponInput';
import { OrderSummaryCard } from '@/components/store/OrderSummaryCard';
import { Breadcrumbs, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, couponCode, couponDiscount, setCoupon } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = itemsTotal - couponDiscount;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleApplyCoupon = async (code: string) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }
    try {
      const coupon = await api.coupons.apply(code);
      setCoupon(coupon.code, coupon.discount);
      toast('success', `${coupon.code} applied to your cart.`);
    } catch (error) {
      setCoupon(undefined, 0);
      toast('error', getApiErrorMessage(error), 'Coupon could not be applied');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        <EmptyState
          icon={<ShoppingBag className="w-16 h-16" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet"
          action={
            <Link to="/">
              <Button size="lg">Start Shopping <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />

      <h1 className="text-2xl font-bold uppercase tracking-tight mt-3 mb-6">
        Shopping Cart ({items.length} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="brutal-card bg-white p-4 flex gap-4">
              <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover brutal-border" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-semibold text-sm hover:text-primary-600 transition-colors line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-xs text-ink-500 mt-0.5">{formatCurrency(item.price)} each</p>

                {item.priceChanged && (
                  <p className="text-xs text-warning-700 font-medium mt-1">
                    Price has changed since you added this item
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center brutal-border">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-paper-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-2 text-sm font-bold border-x-2 border-ink-900 min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-2 hover:bg-paper-100 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="brutal-border bg-white p-2 hover:bg-danger-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-xs font-bold uppercase tracking-wide text-danger-600 hover:text-danger-700"
            >
              Clear Cart
            </button>
            <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="brutal-card bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Have a Coupon?</h3>
            </div>
            <CouponInput
              onApply={handleApplyCoupon}
              appliedCode={couponCode}
              discount={couponDiscount}
              onRemove={() => setCoupon(undefined, 0)}
            />
          </div>

          {/* Summary */}
          <OrderSummaryCard
            items={items}
            itemsTotal={itemsTotal}
            discountTotal={couponDiscount}
            grandTotal={grandTotal}
            couponCode={couponCode}
          />

          <Button fullWidth size="lg" onClick={handleCheckout}>
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
