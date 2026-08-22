import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-7 brutal-border transition-colors duration-150',
          checked ? 'bg-success-500' : 'bg-paper-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 bg-white brutal-border transition-all duration-150',
            checked ? 'left-[26px]' : 'left-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>}
    </label>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'w-5 h-5 brutal-border flex items-center justify-center transition-all duration-150',
          checked ? 'bg-ink-900 text-white' : 'bg-white',
        )}
      >
        {checked && <span className="text-xs font-bold">✓</span>}
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
