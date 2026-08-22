import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, CreditCard, MapPin, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusBadge } from '@/components/admin/StatusBadge';
import { MediaImage } from '@/components/ui/MediaImage';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

const statusFlow: Array<Extract<OrderStatus, 'placed' | 'processing' | 'shipped' | 'delivered'>> = ['placed', 'processing', 'shipped', 'delivered'];

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    void api.orders.detail(id)
      .then((nextOrder) => mounted && setOrder(nextOrder))
      .catch((error) => mounted && toast('error', getApiErrorMessage(error), 'Could not load order'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id, toast]);

  const advanceOrder = async () => {
    if (!id || !order) return;
    const currentIndex = statusFlow.indexOf(order.status as (typeof statusFlow)[number]);
    const nextStatus = statusFlow[currentIndex + 1] as 'processing' | 'shipped' | 'delivered' | undefined;
    if (!nextStatus) return;
    setUpdating(true);
    try {
      const updated = await api.orders.updateStatus(id, nextStatus);
      setOrder(updated);
      toast('success', `Order advanced to ${nextStatus}.`, 'Status updated');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-sm font-bold uppercase text-ink-400">Loading order…</div>;
  if (!order) return <div className="max-w-xl mx-auto py-20 text-center"><h2 className="text-xl font-bold uppercase">Order not found</h2><Button className="mt-4" onClick={() => navigate('/admin/orders')}>Back to orders</Button></div>;

  const currentStepIndex = statusFlow.indexOf(order.status as (typeof statusFlow)[number]);
  const canAdvance = currentStepIndex >= 0 && currentStepIndex < statusFlow.length - 1;
  const iconMap = { placed: Clock, processing: Package, shipped: Truck, delivered: CheckCircle };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><button onClick={() => navigate('/admin/orders')} className="brutal-border bg-white p-2 hover:bg-paper-100" aria-label="Back to orders"><ArrowLeft className="w-5 h-5" /></button><div><h2 className="text-xl font-bold uppercase tracking-tight">{order.orderNumber}</h2><p className="text-sm text-ink-500">{formatDateTime(order.createdAt)}</p></div></div><OrderStatusBadge status={order.status} /></div>

      <section className="brutal-card bg-white p-4"><h3 className="font-bold text-sm uppercase tracking-wide mb-4">Fulfillment status</h3><div className="flex items-center justify-between mb-4">{statusFlow.map((status, index) => { const Icon = iconMap[status]; const complete = index <= currentStepIndex; const current = index === currentStepIndex; return <div key={status} className="flex items-center flex-1 last:flex-none"><div className="flex flex-col items-center gap-1"><div className={cn('w-10 h-10 brutal-border flex items-center justify-center transition-all', complete ? 'bg-success-500 text-white' : 'bg-white text-ink-300', current && 'shadow-brutal scale-110')}><Icon className="w-5 h-5" /></div><span className={cn('text-2xs font-bold uppercase', complete ? 'text-ink-900' : 'text-ink-300')}>{status}</span></div>{index < statusFlow.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', index < currentStepIndex ? 'bg-success-500' : 'bg-ink-200')} />}</div>; })}</div>{canAdvance && <div className="pt-3 border-t-2 border-ink-100"><Button size="sm" variant="success" onClick={() => void advanceOrder()} loading={updating}><Truck className="w-4 h-4" /> Advance to {statusFlow[currentStepIndex + 1]}</Button></div>}</section>

      <section className="brutal-card bg-white p-4"><h3 className="font-bold text-sm uppercase tracking-wide mb-3 pb-3 border-b-2 border-ink-100">Items</h3><div className="space-y-3">{order.items.map((item, index) => <div key={`${item.productId}-${index}`} className="flex gap-3"><MediaImage src={item.image} alt={item.name} fallbackLabel={item.name} className="w-16 h-16 object-cover brutal-border" /><div className="flex-1"><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-ink-500">SKU: {item.sku}</p></div><div className="text-right"><p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p><p className="text-xs text-ink-500">{item.quantity} × {formatCurrency(item.price)}</p></div></div>)}</div></section>

      <div className="grid md:grid-cols-2 gap-4"><section className="brutal-card bg-white p-4"><div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-primary-600" /><h3 className="font-bold text-xs uppercase tracking-wide">Delivery address</h3></div><p className="text-sm font-semibold">{order.address.fullName}</p><p className="text-sm text-ink-600">{order.address.line1}</p>{order.address.line2 && <p className="text-sm text-ink-600">{order.address.line2}</p>}<p className="text-sm text-ink-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p><p className="text-sm text-ink-600 mt-1">Phone: {order.address.phone}</p></section><section className="brutal-card bg-white p-4"><div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-primary-600" /><h3 className="font-bold text-xs uppercase tracking-wide">Payment summary</h3></div><div className="space-y-1.5"><div className="flex justify-between text-sm"><span className="text-ink-600">Items total</span><span>{formatCurrency(order.itemsTotal)}</span></div>{order.discountTotal > 0 && <div className="flex justify-between text-sm"><span className="text-ink-600">Discount {order.couponCode && `(${order.couponCode})`}</span><span className="text-success-600">-{formatCurrency(order.discountTotal)}</span></div>}<div className="flex justify-between text-sm"><span className="text-ink-600">Payment</span><Badge variant="success" size="sm">COD</Badge></div><div className="flex justify-between pt-2 border-t-2 border-ink-900"><span className="font-bold uppercase text-sm">Grand total</span><span className="font-bold text-base">{formatCurrency(order.grandTotal)}</span></div></div></section></div>

      <section className="brutal-card bg-white p-4"><h3 className="font-bold text-sm uppercase tracking-wide mb-3">Status history</h3><div className="space-y-2">{order.statusHistory.map((entry, index) => <div key={`${entry.timestamp}-${index}`} className="flex items-center gap-3 p-2 brutal-border bg-paper-100"><span className="brutal-border bg-ink-900 text-white px-2 py-0.5 text-2xs font-bold uppercase">{entry.status}</span><span className="text-xs text-ink-500 flex-1">{formatDateTime(entry.timestamp)}</span>{entry.note && <span className="text-xs text-ink-600">{entry.note}</span>}</div>)}</div></section>
    </div>
  );
}
