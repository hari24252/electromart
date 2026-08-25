import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Breadcrumbs, EmptyState } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { api } from '@/api/services';

const statusConfig: Record<OrderStatus, { variant: 'default' | 'primary' | 'accent' | 'success' | 'danger'; icon: typeof Package; label: string }> = {
  placed: { variant: 'accent', icon: Clock, label: 'Placed' },
  processing: { variant: 'primary', icon: Package, label: 'Processing' },
  shipped: { variant: 'primary', icon: Truck, label: 'Shipped' },
  delivered: { variant: 'success', icon: CheckCircle, label: 'Delivered' },
  cancelled: { variant: 'danger', icon: XCircle, label: 'Cancelled' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.orders.mine()
      .then((result) => setOrders(result.items))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm font-bold uppercase text-ink-400">Loading your orders…</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Orders' }]} />
        <EmptyState
          icon={<Package className="w-16 h-16" />}
          title="No orders yet"
          description="When you place orders, they'll show up here"
          action={
            <Link to="/">
              <Button size="lg">Start Shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Orders' }]} />

      <h1 className="text-2xl font-bold uppercase tracking-tight mt-3 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;

          return (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block brutal-card bg-white brutal-card-hover"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-ink-100 bg-paper-100">
                <div>
                  <p className="font-bold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-ink-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <Badge variant={config.variant}>
                  <StatusIcon className="w-3 h-3" /> {config.label}
                </Badge>
              </div>

              {/* Items preview */}
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  {order.items.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover brutal-border"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-16 h-16 brutal-border bg-paper-100 flex items-center justify-center text-xs font-bold text-ink-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-ink-500">{order.items.length} item(s)</p>
                    <p className="font-bold text-lg">{formatCurrency(order.grandTotal)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary-600">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
