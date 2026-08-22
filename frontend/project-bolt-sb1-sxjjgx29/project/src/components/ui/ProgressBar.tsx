import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantClasses = {
  default: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-400',
  danger: 'bg-danger-500',
};

export function ProgressBar({ value, max = 100, label, variant = 'default', className }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</span>
          <span className="text-xs font-bold text-ink-900">{Math.round(percent)}%</span>
        </div>
      )}
      <div className="w-full h-4 bg-paper-200 brutal-border overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 ease-brutal', variantClasses[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
