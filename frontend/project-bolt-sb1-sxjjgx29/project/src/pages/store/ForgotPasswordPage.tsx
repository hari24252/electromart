import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, KeyRound, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [form, setForm] = useState({ identifier: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 1) {
        await api.auth.forgotPassword(form.identifier);
        setStep(2);
        toast('info', 'If the account exists, a reset code has been sent.', 'Check your inbox');
      } else if (step === 2) {
        await api.auth.verifyOtp(form.identifier, 'reset', form.otp);
        setStep(3);
      } else {
        await api.auth.resetPassword(form.identifier, form.newPassword);
        toast('success', 'Your password has been reset. Sign in with the new password.', 'Done');
        navigate('/login');
      }
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size="lg" className="justify-center" />
          <p className="mt-2 text-sm text-ink-500">Reset your password</p>
        </div>

        <div className="brutal-card bg-white p-6">
          {/* Steps indicator */}
          <div className="flex items-center justify-between mb-6">
            {['Identify', 'Verify', 'Reset'].map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 brutal-border flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-success-500 text-white' : step === i + 1 ? 'bg-ink-900 text-white' : 'bg-white text-ink-300'}`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`ml-1.5 text-xs font-bold uppercase ${step >= i + 1 ? 'text-ink-900' : 'text-ink-300'}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-success-500' : 'bg-ink-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="flex gap-0 mb-4 brutal-border">
                <button onClick={() => setMode('email')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold uppercase ${mode === 'email' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100'}`}>
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button onClick={() => setMode('phone')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold uppercase ${mode === 'phone' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100'}`}>
                  <Phone className="w-4 h-4" /> Phone
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={mode === 'email' ? 'Email' : 'Phone'} type={mode === 'email' ? 'email' : 'tel'} placeholder={mode === 'email' ? 'you@example.com' : '9876543210'} value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required />
                <Button type="submit" fullWidth size="lg" loading={loading}>Send Reset OTP</Button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-ink-600 text-center">Enter the 6-digit OTP sent to <span className="font-bold">{form.identifier}</span></p>
              <Input label="OTP Code" placeholder="6-digit code" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required maxLength={6} className="text-center text-lg tracking-widest" />
              <Button type="submit" fullWidth size="lg" variant="primary" loading={loading}>Verify OTP</Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-center mb-2">
                <KeyRound className="w-8 h-8 text-primary-600" />
              </div>
              <Input label="New Password" type="password" placeholder="At least 10 characters" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={10} />
              <Button type="submit" fullWidth size="lg" variant="success" loading={loading}><Check className="w-4 h-4" /> Reset Password</Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t-2 border-ink-100 text-center">
            <Link to="/login" className="text-sm font-bold text-primary-600 hover:text-primary-700">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
