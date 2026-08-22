import { Badge } from '@/components/ui/Badge';
import { Package, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { OrderStatus, ProductStatus } from '@/types';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { variant: 'accent' | 'primary' | 'success' | 'danger' | 'warning'; icon: typeof Package; label: string }> = {
    placed: { variant: 'accent', icon: Clock, label: 'Placed' },
    processing: { variant: 'primary', icon: Package, label: 'Processing' },
    shipped: { variant: 'primary', icon: Truck, label: 'Shipped' },
    delivered: { variant: 'success', icon: CheckCircle, label: 'Delivered' },
    cancelled: { variant: 'danger', icon: XCircle, label: 'Cancelled' },
  };
  const c = config[status];
  const Icon = c.icon;
  return <Badge variant={c.variant} size="sm"><Icon className="w-3 h-3" /> {c.label}</Badge>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const config: Record<ProductStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; icon: typeof Package; label: string }> = {
    active: { variant: 'success', icon: CheckCircle, label: 'Active' },
    draft: { variant: 'warning', icon: AlertCircle, label: 'Draft' },
    'out-of-stock': { variant: 'danger', icon: XCircle, label: 'Out of Stock' },
    archived: { variant: 'default', icon: Package, label: 'Archived' },
  };
  const c = config[status];
  const Icon = c.icon;
  return <Badge variant={c.variant} size="sm"><Icon className="w-3 h-3" /> {c.label}</Badge>;
}
