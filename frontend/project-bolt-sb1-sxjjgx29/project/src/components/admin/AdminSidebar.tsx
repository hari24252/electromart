import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Ticket, Users, Settings, LogOut,
  Zap, ChevronLeft, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/api/services';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    void api.adminAuth.logout().catch(() => undefined);
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden" onClick={onClose} />}

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 bottom-0 z-50 lg:z-10',
        'w-64 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 text-white flex flex-col h-screen',
        'transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl text-white shadow-glow-blue">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <span className="font-bold font-display uppercase tracking-tight text-white">
              Electro<span className="text-brand-400">Mart</span>
              <span className="block text-[10px] font-mono text-brand-400 font-normal">Admin Control</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all',
                  isActive(item.href)
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
