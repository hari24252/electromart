import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto p-4 rounded-xl backdrop-blur-md shadow-glass border flex items-start gap-3 animate-slide-in-right transition-all',
        toast.type === 'success' && 'bg-slate-900/90 border-emerald-500/40 text-emerald-300',
        toast.type === 'error' && 'bg-slate-900/90 border-rose-500/40 text-rose-300',
        toast.type === 'info' && 'bg-slate-900/90 border-brand-500/40 text-brand-300'
      )}
    >
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
      {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />}

      <div className="flex-1">
        <h4 className="text-xs font-bold font-display text-white">{toast.title}</h4>
        {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
