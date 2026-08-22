import { type SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="brutal-label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full appearance-none bg-white brutal-border px-4 py-2.5 pr-10 text-ink-900',
              'focus:outline-none focus:shadow-brutal focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150 cursor-pointer',
              error && 'border-danger-500',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-700 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs font-medium text-danger-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
