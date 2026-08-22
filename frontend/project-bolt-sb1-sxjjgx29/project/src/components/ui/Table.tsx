import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('w-full overflow-x-auto brutal-border bg-white', className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-ink-900 text-white">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-2xs font-bold uppercase tracking-wider whitespace-nowrap',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y-2 divide-ink-100">{children}</tbody>;
}

export function TR({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'hover:bg-paper-100 transition-colors',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-sm', className)}>{children}</td>;
}
