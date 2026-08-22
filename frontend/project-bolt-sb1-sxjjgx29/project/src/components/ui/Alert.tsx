import { type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  success: { bg: 'bg-success-100', border: 'border-success-600', icon: CheckCircle2, iconColor: 'text-success-700' },
  error: { bg: 'bg-danger-100', border: 'border-danger-600', icon: XCircle, iconColor: 'text-danger-700' },
  info: { bg: 'bg-primary-100', border: 'border-primary-700', icon: Info, iconColor: 'text-primary-700' },
  warning: { bg: 'bg-warning-100', border: 'border-warning-600', icon: AlertTriangle, iconColor: 'text-warning-700' },
};

export function Alert({ variant, title, children, onClose, className }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 p-4 brutal-border', config.bg, config.border, className)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1">
        {title && <p className="font-bold text-sm uppercase tracking-wide">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
