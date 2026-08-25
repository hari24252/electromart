import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Ticket, Users, Settings, LogOut, ChevronLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/api/services';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
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
  const adminLogout = useAuthStore((state) => state.adminLogout);
  const isActive = (href: string) => href === '/admin' ? location.pathname === href : location.pathname.startsWith(href);

  const handleLogout = () => {
    void api.adminAuth.logout().catch(() => undefined);
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-ink-900/20 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-paper-300 bg-white transition-transform lg:sticky lg:top-0 lg:z-10',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="flex items-center justify-between border-b border-paper-300 p-5">
          <Link to="/admin" onClick={onClose}><Logo size="sm" /></Link>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-ink-500 hover:bg-paper-100 lg:hidden"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-5 pb-3 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Store management</div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900',
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-paper-300 p-3">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-600 hover:bg-paper-100" onClick={onClose}><ChevronLeft className="h-4 w-4" /> Storefront</Link>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-brand-600 hover:bg-brand-50"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
    </>
  );
}
