import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isSessionReady } = useAuthStore((state) => ({ isAdmin: state.isAdmin, isSessionReady: state.isSessionReady }));
  if (!isSessionReady) return <div className="grid min-h-screen place-items-center bg-paper-100 text-sm font-bold uppercase text-ink-400">Checking administrator session…</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}
