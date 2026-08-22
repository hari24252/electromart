import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Zap } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const setUserSession = useAuthStore((s) => s.setUserSession);
  const { toast } = useToast();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ identifier: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 1) {
        await api.auth.login(form.identifier, form.password);
        setStep(2);
        toast('info', 'A six-digit sign-in code has been sent.', 'Verify your account');
      } else {
        const tokens = await api.auth.verifyLoginOtp(form.identifier, form.otp);
        const user = await api.auth.me();
        setUserSession(user, tokens.accessToken);
        toast('success', 'Welcome back to Electromart!', 'Signed in');
        navigate(redirect);
      }
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size="lg" className="justify-center" />
          <p className="mt-2 text-sm text-ink-500">Sign in to your account</p>
        </div>

        <div className="brutal-card bg-white p-6">
          {/* Mode toggle */}
          <div className="flex gap-0 mb-4 brutal-border">
            <button
              onClick={() => setMode('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'email' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100'}`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              onClick={() => setMode('phone')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'phone' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100'}`}
            >
              <Phone className="w-4 h-4" /> Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <Input
                  label={mode === 'email' ? 'Email' : 'Phone Number'}
                  type={mode === 'email' ? 'email' : 'tel'}
                  placeholder={mode === 'email' ? 'you@example.com' : '9876543210'}
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-bold uppercase tracking-wide text-primary-600 hover:text-primary-700">
                    Forgot Password?
                  </Link>
                </div>
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-2">
                  <div className="inline-flex brutal-border bg-accent-400 p-3 mb-3">
                    <Zap className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold">Enter the OTP sent to</p>
                  <p className="text-sm font-bold text-primary-600">{form.identifier}</p>
                </div>
                <Input
                  label="OTP Code"
                  placeholder="6-digit code"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  required
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button type="submit" fullWidth size="lg" variant="success" loading={loading}>
                  Verify & Sign In
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-bold uppercase tracking-wide text-ink-500 hover:text-ink-900"
                >
                  ← Back
                </button>
              </>
            )}
          </form>

          <div className="mt-6 pt-4 border-t-2 border-ink-100 text-center">
            <p className="text-sm text-ink-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-700">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/admin/login" className="text-xs font-bold uppercase tracking-wide text-ink-400 hover:text-ink-900">
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
