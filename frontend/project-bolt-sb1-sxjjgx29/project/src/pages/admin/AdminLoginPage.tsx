import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { Logo } from '@/components/layout/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
        <div className="text-center mb-6">
          <div className="inline-flex justify-center"><Logo size="md" /></div>
        </div>
        <section className="brutal-card bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">Admin sign in</h1>
              <p className="text-sm leading-6 text-ink-600">Use your provisioned administrator credentials.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" fullWidth size="lg" variant="secondary" loading={loading}>
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </section>
        <p className="mt-5 text-center text-sm text-ink-600"><Link to="/" className="font-medium text-brand-600 hover:text-brand-700">← Return to storefront</Link></p>
      </div>
    </main>
  );
}
