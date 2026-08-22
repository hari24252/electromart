import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, Package, MapPin, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/api/services';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openCart } = useCartStore();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
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
    <div className="flex items-center gap-2">
      <Link
        to="/wishlist"
        className="relative brutal-border bg-white p-2.5 hover:bg-paper-200 transition-colors group"
        title="Wishlist"
      >
        <Heart className="w-5 h-5 group-hover:fill-danger-500 group-hover:text-danger-500 transition-colors" />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-2xs font-bold brutal-border px-1.5 py-0.5 min-w-[18px] text-center">
            {wishlistCount}
          </span>
        )}
      </Link>

      <button
        onClick={openCart}
        className="relative brutal-border bg-accent-400 p-2.5 hover:bg-accent-500 transition-colors"
        title="Cart"
      >
        <ShoppingBag className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-ink-900 text-white text-2xs font-bold brutal-border px-1.5 py-0.5 min-w-[18px] text-center">
            {totalItems}
          </span>
        )}
      </button>

      <div ref={ref} className="relative">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="brutal-border bg-white p-2.5 hover:bg-paper-200 transition-colors flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase">{user?.name?.split(' ')[0]}</span>
            </button>
            {isOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white brutal-border shadow-brutal z-50 animate-fade-in">
                <div className="p-3 border-b-2 border-ink-900 bg-paper-100">
                  <p className="font-bold text-sm">{user?.name}</p>
                  <p className="text-xs text-ink-500">{user?.email || user?.phone}</p>
                </div>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-paper-100 transition-colors border-b border-ink-100">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link to="/addresses" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-paper-100 transition-colors border-b border-ink-100">
                  <MapPin className="w-4 h-4" /> Addresses
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-paper-100 transition-colors border-b border-ink-100">
                  <Settings className="w-4 h-4" /> Profile
                </Link>
                <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-paper-100 transition-colors border-b border-ink-100">
                  <Shield className="w-4 h-4" /> Admin Portal
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-danger-500 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            className="brutal-border bg-ink-900 text-white p-2.5 hover:bg-ink-800 transition-colors flex items-center gap-2"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold uppercase">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
