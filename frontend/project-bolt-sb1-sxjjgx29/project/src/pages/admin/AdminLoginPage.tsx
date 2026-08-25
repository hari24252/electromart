import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { Logo } from '@/components/layout/Logo';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const setAdminSession = useAuthStore((state) => state.setAdminSession);
  const setAdminAccessToken = useAuthStore((state) => state.setAdminAccessToken);
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const tokens = await api.adminAuth.login(form.email, form.password);
      // Set the token before /me; the admin profile endpoint requires it.
      setAdminAccessToken(tokens.accessToken);
      const admin = await api.adminAuth.me();
      setAdminSession(admin, tokens.accessToken);
      toast('success', 'Welcome back.', 'Signed in');
      navigate('/admin');
    } catch (error) {
      setAdminAccessToken(null);
      toast('error', getApiErrorMessage(error), 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-paper-100 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-10 inline-flex"><Logo size="md" /></Link>
        <section className="rounded-2xl border border-paper-300 bg-white p-6 shadow-glass sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"><ShieldCheck className="h-5 w-5" /></span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-ink-600">Use the administrator email and password from <code className="rounded bg-paper-100 px-1.5 py-0.5 text-xs text-ink-700">backend/.env</code>.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Email address</span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="glass-input"
                placeholder="admin@example.com"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="glass-input"
                placeholder="Enter your password"
                required
              />
            </label>
            <button type="submit" disabled={loading} className="glass-button mt-2 w-full rounded-lg py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
        <p className="mt-5 text-center text-sm text-ink-600"><Link to="/" className="font-medium text-brand-600 hover:text-brand-700">← Return to storefront</Link></p>
      </div>
    </main>
  );
}
