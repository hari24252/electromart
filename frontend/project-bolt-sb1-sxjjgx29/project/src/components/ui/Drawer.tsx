import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'right' | 'left';
  width?: 'sm' | 'md' | 'lg';
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Drawer({ isOpen, onClose, children, title, side = 'right', width = 'md' }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-ink-950/70 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'absolute top-0 bottom-0 w-full bg-white brutal-border-3 shadow-brutal-2xl flex flex-col animate-slide-in-right',
          side === 'right' ? 'right-0' : 'left-0 animate-slide-in-left',
          widthClasses[width],
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b-2 border-ink-900 bg-paper-100">
            <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="brutal-border bg-white px-3 py-1 font-bold text-sm hover:bg-danger-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
