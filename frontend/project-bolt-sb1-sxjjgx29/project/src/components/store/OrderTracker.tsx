import type { Order, OrderStatus } from '@/types';
import { Check, Package, Truck, Home, Clock, X } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';

interface OrderTrackerProps {
  order: Order;
}

const statusSteps: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'placed', label: 'Order Placed', icon: Check },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

export function OrderTracker({ order }: OrderTrackerProps) {
  const isCancelled = order.status === 'cancelled';
  const currentStepIdx = statusSteps.findIndex((s) => s.status === order.status);

  if (isCancelled) {
    return (
      <div className="brutal-card bg-danger-100 p-6 text-center">
        <div className="inline-flex brutal-border bg-danger-500 text-white p-3 mb-3">
          <X className="w-6 h-6" />
        </div>
        <p className="font-bold uppercase tracking-wide text-danger-700">Order Cancelled</p>
        <p className="text-sm text-ink-500 mt-1">This order was cancelled. Any reserved stock has been restored.</p>
      </div>
    );
  }

  return (
    <div className="brutal-card bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold uppercase tracking-wide">Order Tracking</h3>
        <span className="text-sm font-bold text-primary-600">#{order.orderNumber}</span>
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-ink-200" />
        <div
          className="absolute top-5 left-5 h-0.5 bg-success-500 transition-all duration-500"
          style={{ width: `calc(${(currentStepIdx / (statusSteps.length - 1)) * 100}% - 1.25rem)` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, i) => {
            const Icon = step.icon;
            const isComplete = i <= currentStepIdx;
            const isCurrent = i === currentStepIdx;
            const historyEntry = order.statusHistory.find((h) => h.status === step.status);

            return (
              <div key={step.status} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    'w-10 h-10 brutal-border flex items-center justify-center transition-all z-10',
                    isComplete ? 'bg-success-500 text-white' : 'bg-white text-ink-300',
                    isCurrent && 'shadow-brutal scale-110',
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={cn('text-xs font-bold uppercase tracking-wide', isComplete ? 'text-ink-900' : 'text-ink-300')}>
                    {step.label}
                  </p>
                  {historyEntry && (
                    <p className="text-2xs text-ink-500 mt-0.5 flex items-center justify-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDateTime(historyEntry.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
