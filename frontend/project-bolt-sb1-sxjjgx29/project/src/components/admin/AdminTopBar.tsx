import { Menu, Bell, Search, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AdminTopBarProps {
  onMenuClick: () => void;
  title: string;
}

export function AdminTopBar({ onMenuClick, title }: AdminTopBarProps) {
  const { admin } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-display text-white tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search orders, SKU..."
              className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50 w-60"
            />
          </div>

          <button className="relative p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80 transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="p-1 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">{admin?.name ?? 'Master Admin'}</p>
              <p className="text-[10px] font-mono text-brand-400 leading-tight">{admin?.role ?? 'admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
