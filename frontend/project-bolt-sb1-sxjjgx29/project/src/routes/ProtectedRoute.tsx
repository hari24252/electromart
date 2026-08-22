import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isSessionReady } = useAuthStore((state) => ({ isAuthenticated: state.isAuthenticated, isSessionReady: state.isSessionReady }));
  const location = useLocation();
  if (!isSessionReady) return <div className="grid min-h-[45vh] place-items-center text-sm font-bold uppercase text-ink-400">Checking your session…</div>;
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
