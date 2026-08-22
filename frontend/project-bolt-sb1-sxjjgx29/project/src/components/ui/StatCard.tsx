import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  change?: { value: string; positive: boolean };
  color?: 'primary' | 'accent' | 'success' | 'danger' | 'warning';
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-500 text-white',
  accent: 'bg-accent-400 text-ink-900',
  success: 'bg-success-500 text-white',
  danger: 'bg-danger-500 text-white',
  warning: 'bg-warning-400 text-ink-900',
};

export function StatCard({ label, value, icon, change, color = 'primary', className }: StatCardProps) {
  return (
    <div className={cn('brutal-card group brutal-card-hover', className)}>
      <div className="flex items-start justify-between p-4">
        <div className="flex-1">
          <p className="text-2xs font-bold uppercase tracking-wider text-ink-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs font-bold',
                change.positive ? 'text-success-600' : 'text-danger-600',
              )}
            >
              {change.positive ? '↑' : '↓'} {change.value}
            </p>
          )}
        </div>
        <div className={cn('brutal-border p-2.5', colorClasses[color])}>{icon}</div>
      </div>
    </div>
  );
}
