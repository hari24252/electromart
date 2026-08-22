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
          <label htmlFor={id} className="brutal-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn('brutal-input', error && 'border-danger-500 shadow-brutal', className)}
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
          <label htmlFor={id} className="brutal-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn('brutal-input resize-y min-h-[100px]', error && 'border-danger-500', className)}
          {...props}
        />
        {error && <p className="mt-1 text-xs font-medium text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
