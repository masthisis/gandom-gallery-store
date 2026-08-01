import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../lib/api';

export function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const qs = params.toString();
        const res = await api.digipayCallback(qs);
        const ok = !!res.ok;

        if (ok && getToken()) {
          const raw = sessionStorage.getItem('gandom_checkout_snapshot');
          if (raw) {
            try {
              const snapshot = JSON.parse(raw);
              await api.saveFromCheckout(snapshot);
            } catch {
              /* profile already applied via digipay callback */
            }
            sessionStorage.removeItem('gandom_checkout_snapshot');
          }
        }

        setStatus(ok ? 'ok' : 'fail');
      } catch {
        const s = (params.get('status') || '').toUpperCase();
        const ok = s.includes('SUCCESS') || params.get('mock') === '1';
        if (ok && getToken()) {
          const raw = sessionStorage.getItem('gandom_checkout_snapshot');
          if (raw) {
            try {
              await api.saveFromCheckout(JSON.parse(raw));
            } catch {
              /* ignore */
            }
            sessionStorage.removeItem('gandom_checkout_snapshot');
          }
        }
        setStatus(ok ? 'ok' : 'fail');
      }
    })();
  }, [params]);

  return (
    <div className="dk-container py-20 text-center max-w-lg">
      {status === 'loading' && <p>در حال بررسی پرداخت...</p>}
      {status === 'ok' && (
        <>
          <h1 className="text-2xl font-bold text-[var(--dk-accent)] mb-3">پرداخت موفق</h1>
          <p className="text-[var(--dk-muted)] mb-6">
            سفارش شما ثبت شد. اطلاعات پروفایل و آدرس برای خرید بعدی ذخیره شد.
          </p>
          <Link to="/account" className="text-[var(--dk-cta)] font-medium">
            مشاهده حساب کاربری
          </Link>
        </>
      )}
      {status === 'fail' && (
        <>
          <h1 className="text-2xl font-bold text-red-600 mb-3">پرداخت ناموفق</h1>
          <p className="text-[var(--dk-muted)] mb-6">در صورت کسر وجه، طی ۲۴ ساعت برگشت داده می‌شود.</p>
          <Link to="/checkout" className="text-[var(--dk-cta)] font-medium">
            تلاش مجدد
          </Link>
        </>
      )}
    </div>
  );
}
