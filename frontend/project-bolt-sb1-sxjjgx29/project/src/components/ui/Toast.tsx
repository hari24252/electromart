import { createContext, useContext, useReducer, type ReactNode, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextValue {
  toast: ( (type: ToastType, message: string, title?: string) => void);
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string };

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
  }
}

const toastConfig = {
  success: { icon: CheckCircle2, bg: 'bg-success-500', text: 'text-white' },
  error: { icon: XCircle, bg: 'bg-danger-500', text: 'text-white' },
  info: { icon: Info, bg: 'bg-primary-500', text: 'text-white' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-400', text: 'text-ink-900' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const toast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'ADD', toast: { id, type, message, title } });
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const config = toastConfig[t.type];
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-3 p-3 brutal-border-3 shadow-brutal animate-slide-in-right min-w-[280px]',
                config.bg,
                config.text,
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {t.title && <p className="font-bold text-sm uppercase tracking-wide">{t.title}</p>}
                <p className="text-sm">{t.message}</p>
              </div>
              <button onClick={() => dismiss(t.id)} className="flex-shrink-0 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
