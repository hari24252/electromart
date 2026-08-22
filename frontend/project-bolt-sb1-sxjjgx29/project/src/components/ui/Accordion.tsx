import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({ title, children, defaultOpen, className }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className={cn('brutal-border bg-white', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 font-semibold text-sm uppercase tracking-wide hover:bg-paper-100 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn('w-5 h-5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="p-4 border-t-2 border-ink-900 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
