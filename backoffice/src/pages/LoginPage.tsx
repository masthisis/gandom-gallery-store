import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, setAdminToken } from '../lib/api';

export function LoginPage() {
  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await adminApi.otpRequest(mobile);
      setStep('code');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await adminApi.otpVerify(mobile, otp || '11111');
      setAdminToken(res.jwt);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function passwordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await adminApi.login(email, password);
      setAdminToken(res.jwt);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'ورود ناموفق');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-xl font-bold mb-1">پنل مدیریت گندم گالری</h1>
        <p className="text-sm text-gray-500 mb-6">ورود کارکنان</p>
        <div className="flex gap-2 mb-4 text-sm">
          <button
            className={`px-3 py-1 rounded-lg ${mode === 'otp' ? 'bg-[#ef4056] text-white' : 'bg-gray-100'}`}
            onClick={() => setMode('otp')}
          >
            موبایل
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${mode === 'password' ? 'bg-[#ef4056] text-white' : 'bg-gray-100'}`}
            onClick={() => setMode('password')}
          >
            ایمیل
          </button>
        </div>
        {mode === 'otp' ? (
          step === 'phone' ? (
            <form onSubmit={requestCode} className="space-y-3">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="09xxxxxxxxx"
                dir="ltr"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <button className="w-full bg-[#ef4056] text-white rounded-lg py-2.5">دریافت کد</button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-3">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="11111"
                dir="ltr"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="w-full bg-[#ef4056] text-white rounded-lg py-2.5">ورود</button>
            </form>
          )
        ) : (
          <form onSubmit={passwordLogin} className="space-y-3">
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="ایمیل"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="رمز"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-[#ef4056] text-white rounded-lg py-2.5">ورود</button>
          </form>
        )}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <p className="text-xs text-gray-400 mt-4">در حالت توسعه کد پیش‌فرض: ۱۱۱۱۱</p>
      </div>
    </div>
  );
}
