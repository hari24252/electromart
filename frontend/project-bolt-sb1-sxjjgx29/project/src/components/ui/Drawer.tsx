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
      <div className="absolute inset-0 bg-ink-900/30" onClick={onClose} />
      <div
        className={cn(
          'absolute top-0 bottom-0 flex w-full flex-col bg-white shadow-2xl',
          side === 'right' ? 'right-0 rounded-l-2xl' : 'left-0 rounded-r-2xl',
          widthClasses[width],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-paper-300 p-4">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900"
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
