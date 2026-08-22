import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'rounded-full border-ink-900 border-t-transparent animate-spin',
          sizeClasses[size],
          className,
        )}
      />
    </div>
  );
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Spinner size="lg" />
      {message && <p className="text-sm font-semibold uppercase tracking-wider text-ink-500">{message}</p>}
    </div>
  );
}
