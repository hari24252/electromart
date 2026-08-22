import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export function Modal({ isOpen, onClose, children, title, size = 'md', closeOnOverlay = true }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/70 animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={cn(
          'relative w-full bg-white brutal-border-3 shadow-brutal-2xl animate-scale-in',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b-2 border-ink-900 bg-paper-100">
            <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
