import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, X } from 'lucide-react';
import { OrderTracker } from '@/components/store/OrderTracker';
import { Breadcrumbs } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancel, setShowCancel] = useState(false);
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    void api.orders.mineDetail(id)
      .then(setOrder)
      .catch(() => setOrder(undefined))
      .finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!id) return;
    try {
      const updatedOrder = await api.orders.cancel(id);
      setOrder(updatedOrder);
      setShowCancel(false);
      toast('success', 'Order cancelled and stock restored.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not cancel order');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm font-bold uppercase text-ink-400">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold uppercase tracking-tight mb-2">Order Not Found</h1>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const canCancel = order.status === 'placed';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Orders', href: '/orders' },
        { label: order.orderNumber },
      ]} />

      <div className="flex items-center justify-between mt-3 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="brutal-border bg-white p-2 hover:bg-paper-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">{order.orderNumber}</h1>
            <p className="text-sm text-ink-500">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" /> Invoice
          </Button>
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}>
              <X className="w-4 h-4" /> Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Tracker */}
      <OrderTracker order={order} />

      {/* Items + Summary */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2 space-y-3">
          <div className="brutal-card bg-white p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3 pb-3 border-b-2 border-ink-100">
              Items in Order
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <Link to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover brutal-border" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.slug}`} className="text-sm font-semibold hover:text-primary-600 transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-xs text-ink-500 mt-0.5">SKU: {item.sku}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-ink-500">Qty: {item.quantity} × {formatCurrency(item.price)}</span>
                      <span className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Address */}
          <div className="brutal-card bg-white p-4">
            <h3 className="font-bold text-xs uppercase tracking-wide text-ink-500 mb-2">Delivery Address</h3>
            <p className="font-semibold text-sm">{order.address.fullName}</p>
            <p className="text-sm text-ink-600">{order.address.line1}</p>
            {order.address.line2 && <p className="text-sm text-ink-600">{order.address.line2}</p>}
            <p className="text-sm text-ink-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            <p className="text-sm text-ink-600 mt-1">Phone: {order.address.phone}</p>
          </div>

          {/* Payment */}
          <div className="brutal-card bg-white p-4">
            <h3 className="font-bold text-xs uppercase tracking-wide text-ink-500 mb-2">Payment</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Method</span>
              <Badge variant="success">COD</Badge>
            </div>
            <div className="space-y-1 pt-2 border-t-2 border-ink-100">
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Items Total</span>
                <span>{formatCurrency(order.itemsTotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="text-success-600">-{formatCurrency(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-ink-900">
                <span className="font-bold uppercase text-sm">Total</span>
                <span className="font-bold text-base">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => { void cancelOrder(); }}
        title="Cancel Order?"
        message="This order will be cancelled and reserved stock will be restored. This action cannot be undone."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
      />
    </div>
  );
}
