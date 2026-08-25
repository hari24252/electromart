import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Package, MapPin, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/api/services';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    void api.auth.logout().catch(() => undefined);
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="flex items-center">
      <div ref={ref} className="relative">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-lg border border-paper-400 bg-white p-2.5 text-ink-700 transition-colors hover:border-ink-300 hover:bg-paper-100"
            >
              <User className="w-5 h-5" />
              <span className="hidden text-sm font-medium sm:inline">{user?.name?.split(' ')[0]}</span>
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-paper-300 bg-white p-1 shadow-lg">
                <div className="border-b border-paper-300 px-3 py-3">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-ink-500">{user?.email || user?.phone}</p>
                </div>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link to="/addresses" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900">
                  <MapPin className="w-4 h-4" /> Addresses
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900">
                  <Settings className="w-4 h-4" /> Profile
                </Link>
                <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900">
                  <Shield className="w-4 h-4" /> Admin Portal
                </Link>
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger-600 transition-colors hover:bg-danger-50 hover:text-danger-700">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg bg-ink-900 p-2.5 text-white transition-colors hover:bg-ink-800"
          >
            <User className="w-5 h-5" />
            <span className="hidden text-sm font-medium sm:inline">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
