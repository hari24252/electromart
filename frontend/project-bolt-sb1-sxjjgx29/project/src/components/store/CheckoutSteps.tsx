import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckoutStepsProps {
  current: number;
  steps?: string[];
}

export function CheckoutSteps({ current, steps = ['Cart', 'Address', 'Payment', 'Confirm'] }: CheckoutStepsProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((step, i) => {
        const isComplete = i < current;
        const isCurrent = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-10 h-10 brutal-border flex items-center justify-center font-bold text-sm transition-all',
                  isComplete && 'bg-success-500 text-white',
                  isCurrent && 'bg-ink-900 text-white shadow-brutal',
                  !isComplete && !isCurrent && 'bg-white text-ink-300',
                )}
              >
                {isComplete ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-2xs font-bold uppercase tracking-wide whitespace-nowrap',
                  (isComplete || isCurrent) ? 'text-ink-900' : 'text-ink-300',
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 transition-colors',
                  i < current ? 'bg-success-500' : 'bg-ink-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
