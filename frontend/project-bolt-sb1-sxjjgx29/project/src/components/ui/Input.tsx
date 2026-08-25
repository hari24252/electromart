import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export { Select } from '@/components/ui/Select';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn('w-full rounded-lg border border-paper-400 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100', error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100', className)}
          {...props}
        />
        {error && <p className="mt-1 text-xs font-medium text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn('min-h-[100px] w-full resize-y rounded-lg border border-paper-400 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100', error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100', className)}
          {...props}
        />
        {error && <p className="mt-1 text-xs font-medium text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
