import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const setAdminSession = useAuthStore((s) => s.setAdminSession);
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = () => {
    setAdminSession(
      {
        _id: 'admin_demo_id',
        name: 'Master Admin',
        email: 'admin@electromart.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      'demo_admin_access_token'
    );
    toast('success', 'Logged in as Demo Master Admin', 'Access Granted');
    navigate('/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokens = await api.adminAuth.login(form.email, form.password);
      const admin = await api.adminAuth.me();
      setAdminSession(admin, tokens.accessToken);
      toast('success', 'Welcome to admin portal', 'Logged In');
      navigate('/admin');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Admin sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-500/10 border border-brand-500/30 rounded-2xl text-brand-400 mb-2 shadow-glow-blue">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display flex items-center justify-center gap-2">
            Admin Portal <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs font-mono text-slate-400">Authorized System Control & Analytics</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-glass space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">Admin Email</label>
              <input
                type="email"
                placeholder="admin@electromart.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-400 uppercase absolute">Or</span>
          </div>

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800/80 text-brand-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <KeyRound className="w-4 h-4 text-brand-400" /> One-Click Demo Admin Access
          </button>

          <div className="pt-2 text-center">
            <Link to="/" className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

