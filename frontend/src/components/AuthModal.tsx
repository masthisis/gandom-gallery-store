import { useState } from 'react';
import { api, setToken } from '../lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: any, jwt: string) => void;
};

export function AuthModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  if (!open) return null;

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.otpRequest(mobile);
      setHint(res.devHint ? `کد توسعه: ${res.devHint}` : '');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.otpVerify(mobile, otp || '11111');
      setToken(res.jwt);
      onSuccess(res.user, res.jwt);
      onClose();
      setStep('phone');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'کد نادرست است');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-bold mb-1">ورود | ثبت‌نام</h2>
        <p className="text-sm text-[var(--dk-muted)] mb-4">فقط با شماره موبایل</p>
        {step === 'phone' ? (
          <form onSubmit={requestOtp} className="space-y-3">
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09xxxxxxxxx"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              dir="ltr"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-[var(--dk-cta)] text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تایید'}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-3">
            <p className="text-sm">کد ارسال‌شده به {mobile}</p>
            {hint && <p className="text-xs text-[var(--dk-accent)]">{hint}</p>}
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="11111"
              className="w-full border rounded-lg px-3 py-2.5 text-sm tracking-widest"
              dir="ltr"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-[var(--dk-cta)] text-white rounded-lg py-2.5 text-sm font-medium"
            >
              تایید و ورود
            </button>
            <button type="button" className="w-full text-sm text-[var(--dk-muted)]" onClick={() => setStep('phone')}>
              تغییر شماره
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
