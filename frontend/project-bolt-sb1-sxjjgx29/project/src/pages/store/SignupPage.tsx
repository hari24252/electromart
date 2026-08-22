import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Check, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

export function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [form, setForm] = useState({ name: '', identifier: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 1) {
        await api.auth.signup({
          name: form.name,
          password: form.password,
          ...(mode === 'email' ? { email: form.identifier } : { phone: form.identifier }),
        });
        await api.auth.sendOtp(form.identifier, 'signup');
        setStep(2);
        toast('info', 'A six-digit verification code has been sent.', 'Verify your account');
      } else {
        await api.auth.verifyOtp(form.identifier, 'signup', form.otp);
        toast('success', 'Account verified. Sign in to continue.', 'Welcome to Electromart');
        navigate('/login');
      }
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size="lg" className="justify-center" />
          <p className="mt-2 text-sm text-ink-500">Create your ElectroMart account</p>
        </div>

        <div className="brutal-card bg-white p-6">
          {step === 1 && (
            <>
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
                <Input
                  label="Full Name"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
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
                  placeholder="At least 10 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={10}
                />
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Create Account <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-4">
                <div className="inline-flex brutal-border bg-success-500 text-white p-3 mb-3">
                  <User className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">Verify your {mode}</p>
                <p className="text-sm font-bold text-primary-600">{form.identifier}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Check className="w-4 h-4" /> Verify & Create Account
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-bold uppercase tracking-wide text-ink-500 hover:text-ink-900"
                >
                  ← Back
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-4 border-t-2 border-ink-100 text-center">
            <p className="text-sm text-ink-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
