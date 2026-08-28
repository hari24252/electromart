import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, X } from 'lucide-react';
import { OrderTracker } from '@/components/store/OrderTracker';
import { InvoicePrint } from '@/components/store/InvoicePrint';
import { Breadcrumbs } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [showCancel, setShowCancel] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm font-semibold text-ink-400 uppercase tracking-widest">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold tracking-tight mb-4">Order Not Found</h1>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const canCancel = order.status === 'placed';

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Orders', href: '/orders' },
          { label: order.orderNumber },
        ]} />

        <div className="flex items-center justify-between mt-3 mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/orders" className="grid h-9 w-9 place-items-center rounded-lg border border-paper-300 bg-white hover:bg-paper-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink-900">{order.orderNumber}</h1>
              <p className="text-sm text-ink-500">Placed on {formatDateTime(order.createdAt)}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInvoice(true)}
            >
              <FileText className="w-4 h-4" /> Invoice / PDF
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
            <div className="rounded-xl border border-paper-300 bg-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide mb-4 pb-3 border-b border-paper-200">
                Items in Order
              </h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <Link to={`/product/${item.slug}`} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border border-paper-200"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.slug}`}
                        className="text-sm font-semibold hover:text-brand-600 transition-colors line-clamp-2 text-ink-900"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-ink-500 mt-0.5">SKU: {item.sku}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-ink-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                        <span className="font-bold text-sm text-ink-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Delivery Address */}
            <div className="rounded-xl border border-paper-300 bg-white p-4">
              <h3 className="font-bold text-xs uppercase tracking-wide text-ink-500 mb-3">Delivery Address</h3>
              <p className="font-semibold text-sm text-ink-900">{order.address.fullName}</p>
              <p className="text-sm text-ink-600 mt-0.5">{order.address.line1}</p>
              {order.address.line2 && <p className="text-sm text-ink-600">{order.address.line2}</p>}
              <p className="text-sm text-ink-600">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              <p className="text-sm text-ink-600 mt-1">📞 {order.address.phone}</p>
            </div>

            {/* Payment & Totals */}
            <div className="rounded-xl border border-paper-300 bg-white p-4">
              <h3 className="font-bold text-xs uppercase tracking-wide text-ink-500 mb-3">Payment Summary</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-ink-600">Method</span>
                <Badge variant="success">COD</Badge>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-paper-200">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">Subtotal</span>
                  <span>{formatCurrency(order.itemsTotal)}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-600">
                      Discount {order.couponCode ? `(${order.couponCode})` : ''}
                    </span>
                    <span className="text-success-600 font-medium">−{formatCurrency(order.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-paper-300 mt-2">
                  <span className="font-bold text-sm text-ink-900">Total</span>
                  <span className="font-bold text-base text-ink-900">{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice modal */}
      {showInvoice && (
        <InvoicePrint
          order={order}
          customerName={user?.name ?? order.address.fullName}
          customerEmail={user?.email}
          onClose={() => setShowInvoice(false)}
        />
      )}

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
    </>
  );
}
