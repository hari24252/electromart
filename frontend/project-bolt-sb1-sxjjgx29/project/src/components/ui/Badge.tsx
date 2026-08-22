import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-ink-900 text-white',
  primary: 'bg-primary-500 text-white',
  accent: 'bg-accent-400 text-ink-900',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-400 text-ink-900',
  danger: 'bg-danger-500 text-white',
  outline: 'bg-white text-ink-900',
};

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 brutal-border font-bold uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-3 py-1 text-xs',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
