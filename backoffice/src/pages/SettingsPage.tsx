import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';

export function SettingsPage() {
  const [tab, setTab] = useState<'store' | 'sms' | 'payment'>('store');
  const [store, setStore] = useState<any>({});
  const [sms, setSms] = useState<any>({});
  const [pay, setPay] = useState<any>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi.storeSetting().then((r) => setStore(r?.data || r || {})).catch(() => {});
    adminApi.smsSetting().then((r) => setSms(r?.data || r || {})).catch(() => {});
    adminApi.paymentSetting().then((r) => setPay(r?.data || r || {})).catch(() => {});
  }, []);

  async function save() {
    setMsg('');
    try {
      if (tab === 'store') await adminApi.saveStoreSetting(store);
      if (tab === 'sms') await adminApi.saveSmsSetting(sms);
      if (tab === 'payment') await adminApi.savePaymentSetting(pay);
      setMsg('ذخیره شد');
    } catch (e: any) {
      setMsg(e.message || 'خطا در ذخیره');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">تنظیمات</h1>
      <div className="flex gap-2 mb-4">
        {(
          [
            ['store', 'فروشگاه'],
            ['sms', 'پیامک (SMS.ir)'],
            ['payment', 'پرداخت (دیجی‌پی)'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === k ? 'bg-[#ef4056] text-white' : 'bg-white border'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-5 space-y-3 max-w-xl">
        {tab === 'store' && (
          <>
            <Field label="نام فروشگاه" value={store.storeName || ''} onChange={(v) => setStore({ ...store, storeName: v })} />
            <Field label="تلفن" value={store.phone || ''} onChange={(v) => setStore({ ...store, phone: v })} />
            <Field
              label="هزینه ارسال (تومان)"
              value={String(store.shippingFlatToman ?? '')}
              onChange={(v) => setStore({ ...store, shippingFlatToman: Number(v) || 0 })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!store.taxEnabled}
                onChange={(e) => setStore({ ...store, taxEnabled: e.target.checked })}
              />
              مالیات فعال
            </label>
          </>
        )}
        {tab === 'sms' && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!sms.enabled}
                onChange={(e) => setSms({ ...sms, enabled: e.target.checked })}
              />
              ارسال واقعی SMS.ir
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sms.devMode !== false}
                onChange={(e) => setSms({ ...sms, devMode: e.target.checked })}
              />
              حالت توسعه (کد ۱۱۱۱۱)
            </label>
            <Field label="API Key" value={sms.apiKey || ''} onChange={(v) => setSms({ ...sms, apiKey: v })} ltr />
            <Field
              label="Template ID"
              value={String(sms.templateId ?? '')}
              onChange={(v) => setSms({ ...sms, templateId: Number(v) || null })}
              ltr
            />
            <Field label="خط ارسال" value={sms.lineNumber || ''} onChange={(v) => setSms({ ...sms, lineNumber: v })} ltr />
            <Field label="کد توسعه" value={sms.devOtpCode || '11111'} onChange={(v) => setSms({ ...sms, devOtpCode: v })} ltr />
          </>
        )}
        {tab === 'payment' && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!pay.enabled}
                onChange={(e) => setPay({ ...pay, enabled: e.target.checked })}
              />
              درگاه دیجی‌پی فعال
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pay.mockMode !== false}
                onChange={(e) => setPay({ ...pay, mockMode: e.target.checked })}
              />
              حالت شبیه‌سازی (بدون فراخوانی واقعی)
            </label>
            <Field label="Base URL" value={pay.baseUrl || ''} onChange={(v) => setPay({ ...pay, baseUrl: v })} ltr />
            <Field label="Client ID" value={pay.clientId || ''} onChange={(v) => setPay({ ...pay, clientId: v })} ltr />
            <Field
              label="Client Secret"
              value={pay.clientSecret || ''}
              onChange={(v) => setPay({ ...pay, clientSecret: v })}
              ltr
            />
            <Field label="Username" value={pay.username || ''} onChange={(v) => setPay({ ...pay, username: v })} ltr />
            <Field label="Password" value={pay.password || ''} onChange={(v) => setPay({ ...pay, password: v })} ltr />
            <Field
              label="Callback URL"
              value={pay.callbackUrl || ''}
              onChange={(v) => setPay({ ...pay, callbackUrl: v })}
              ltr
            />
          </>
        )}
        <button onClick={save} className="bg-[#ef4056] text-white px-5 py-2 rounded-lg">
          ذخیره
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        className="mt-1 w-full border rounded-lg px-3 py-2"
        dir={ltr ? 'ltr' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
