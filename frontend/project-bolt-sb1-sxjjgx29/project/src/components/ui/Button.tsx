import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  accent: 'bg-accent-400 text-ink-900 hover:bg-accent-500 active:bg-accent-600',
  success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700',
  outline: 'bg-white text-ink-900 hover:bg-paper-200 active:bg-paper-300',
  ghost: 'bg-transparent text-ink-700 border-transparent shadow-none hover:bg-paper-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
  icon: 'p-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 brutal-border font-semibold uppercase tracking-wide',
          'transition-all duration-150 ease-brutal shadow-brutal',
          'hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]',
          'active:shadow-brutal-press active:translate-x-[3px] active:translate-y-[3px]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal disabled:hover:translate-x-0 disabled:hover:translate-y-0',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
