import type { CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { MediaImage } from '@/components/ui/MediaImage';

interface OrderSummaryCardProps {
  items: CartItem[];
  itemsTotal: number;
  discountTotal?: number;
  grandTotal?: number;
  couponCode?: string;
  showShipping?: boolean;
}

export function OrderSummaryCard({
  items,
  itemsTotal,
  discountTotal = 0,
  grandTotal,
  couponCode,
  showShipping = true,
}: OrderSummaryCardProps) {
  const total = grandTotal ?? itemsTotal - discountTotal;
  const shippingFee = itemsTotal >= 999 ? 0 : 49;
  const finalTotal = total + shippingFee;

  return (
    <div className="brutal-card bg-white p-4">
      <h3 className="font-bold text-sm uppercase tracking-wide mb-3 pb-3 border-b-2 border-ink-900">
        Order Summary
      </h3>

      {/* Items */}
      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 items-center">
            <div className="relative flex-shrink-0">
              <MediaImage src={item.image} alt={item.name} fallbackLabel={item.name} className="w-14 h-14 object-cover brutal-border" />
              <span className="absolute -top-1.5 -right-1.5 bg-ink-900 text-white text-2xs font-bold brutal-border px-1.5 py-0.5">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
              <p className="text-xs text-ink-500">{formatCurrency(item.price)} × {item.quantity}</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1.5 pt-3 border-t-2 border-ink-100">
        <div className="flex justify-between text-sm">
          <span className="text-ink-600">Subtotal ({items.length} items)</span>
          <span className="font-semibold">{formatCurrency(itemsTotal)}</span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-ink-600">Discount {couponCode && `(${couponCode})`}</span>
            <span className="font-semibold text-success-600">-{formatCurrency(discountTotal)}</span>
          </div>
        )}

        {showShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-ink-600">Shipping</span>
            <span className="font-semibold">
              {shippingFee === 0 ? <span className="text-success-600">FREE</span> : formatCurrency(shippingFee)}
            </span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t-2 border-ink-900">
          <span className="font-bold text-base uppercase">Total</span>
          <span className="font-bold text-lg">{formatCurrency(showShipping ? finalTotal : total)}</span>
        </div>

        {showShipping && shippingFee > 0 && (
          <p className="text-xs text-ink-500 pt-1">
            Add {formatCurrency(999 - itemsTotal)} more for FREE shipping
          </p>
        )}
      </div>
    </div>
  );
}
