import { Menu, Search, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AdminTopBarProps {
  onMenuClick: () => void;
  title: string;
}

export function AdminTopBar({ onMenuClick, title }: AdminTopBarProps) {
  const admin = useAuthStore((state) => state.admin);

  return (
    <header className="sticky top-0 z-30 border-b border-paper-300 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-7">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="rounded-lg border border-paper-400 p-2 text-ink-600 hover:bg-paper-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div>
            <p className="text-xs font-medium text-ink-500">Admin workspace</p>
            <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input type="search" placeholder="Search products or orders" className="w-64 rounded-lg border border-paper-400 bg-white py-2 pl-9 pr-3 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-paper-300 bg-paper-100 px-3 py-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-teal-50 text-teal-700"><ShieldCheck className="h-4 w-4" /></span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-4 text-ink-900">{admin?.name ?? 'Administrator'}</p>
              <p className="mt-0.5 text-xs capitalize text-ink-500">{admin?.role ?? 'admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
