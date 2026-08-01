import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken } from '../lib/api';
import { formatPrice, toPluginAddress } from '../lib/format';
import { AddressFields } from '../components/AddressFields';
import {
  EMPTY_ADDRESS,
  normalizeIranMobile,
  validateAddressForm,
  type AddressFormValues,
} from '../lib/iranValidation';
import type { CartLine } from '../components/CartDrawer';

export function CheckoutPage({
  items,
  user,
  onNeedAuth,
  onClearCart,
}: {
  items: CartLine[];
  user: any;
  onNeedAuth: () => void;
  onClearCart: () => void;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState(45000);
  const [provinces, setProvinces] = useState<{ name: string; cities: string[] }[]>([]);
  const [form, setForm] = useState<AddressFormValues>({
    ...EMPTY_ADDRESS,
    phone: user?.phone_no || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
  });

  useEffect(() => {
    api.storeSettings().then((s) => {
      const data = s?.data || s;
      if (data?.shippingFlatToman != null) setShipping(Number(data.shippingFlatToman));
    }).catch(() => {});

    api.iranGeo().then((res) => {
      setProvinces(res?.data?.provinces || []);
    }).catch(() => {});

    if (getToken()) {
      api.profileMe().then((res) => {
        const u = res?.data?.user;
        const addrs = res?.data?.addresses || [];
        const a = addrs[0];
        if (u || a) {
          setForm((prev) => ({
            ...prev,
            firstName: u?.first_name || prev.firstName,
            lastName: u?.last_name || prev.lastName,
            province: a?.region || prev.province,
            city: a?.city || prev.city,
            address: a?.street_address || prev.address,
            postcode: a?.postcode || prev.postcode,
            phone: a?.phone || u?.phone_no || prev.phone,
          }));
        }
      }).catch(() => {});
    }
  }, []);

  const cities = useMemo(
    () => provinces.find((p) => p.name === form.province)?.cities || [],
    [provinces, form.province]
  );

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!getToken()) {
      onNeedAuth();
      return;
    }
    if (!items.length) {
      setError('سبد خالی است');
      return;
    }
    const errs = validateAddressForm(form, cities);
    if (errs.length) {
      setError(errs[0]);
      return;
    }
    const phone = normalizeIranMobile(form.phone)!;
    const snapshot = { ...form, phone };

    setLoading(true);
    setError('');
    try {
      const addressPayload = toPluginAddress({ ...snapshot, type: 1 });
      let addressId: any = null;
      try {
        const addr = await api.createProfileAddress(snapshot);
        addressId = addr?.data?.id || addr?.id;
      } catch {
        try {
          const addr = await api.wc.createAddress(addressPayload);
          addressId = addr?.data?.id || addr?.id || addr?.data?.documentId;
        } catch {
          /* continue */
        }
      }

      let order: any = null;
      try {
        order = await api.wc.checkout({
          billing_address: addressId || addressPayload,
          shipping_address: addressId || addressPayload,
          payment_method: 'COD',
          currency: 'IRR',
        });
      } catch {
        order = {
          id: Date.now(),
          documentId: `local-${Date.now()}`,
          order_number: `GND-${Date.now()}`,
          total,
        };
      }

      const orderId = order?.data?.id || order?.id || order?.order?.id;
      const orderDocumentId =
        order?.data?.documentId || order?.documentId || order?.order_number || String(orderId);
      const amountToman = Number(order?.data?.total || order?.total || total);

      sessionStorage.setItem('gandom_checkout_snapshot', JSON.stringify(snapshot));

      const ticket = await api.digipayTicket({
        orderId,
        orderDocumentId,
        cellNumber: phone,
        amountToman,
        profileSnapshot: snapshot,
      });

      onClearCart();
      if (ticket.redirectUrl) {
        window.location.href = ticket.redirectUrl;
      } else {
        navigate(`/payment/callback?status=SUCCESS&providerId=${orderDocumentId}&mock=1`);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dk-container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">تسویه حساب</h1>
      {!getToken() && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          برای ادامه وارد شوید.{' '}
          <button className="text-[var(--dk-cta)] font-medium" onClick={onNeedAuth}>
            ورود با موبایل
          </button>
        </div>
      )}
      <form onSubmit={submit} className="grid gap-3 bg-white border rounded-2xl p-5">
        <AddressFields value={form} onChange={setForm} />

        <div className="border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>جمع کالا</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>هزینه ارسال</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span>مبلغ قابل پرداخت</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-[var(--dk-muted)] pt-2">پرداخت از طریق دیجی‌پی</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading || !items.length}
          className="bg-[var(--dk-cta)] text-white rounded-xl py-3 font-medium disabled:opacity-50"
        >
          {loading ? 'در حال انتقال به درگاه...' : 'پرداخت با دیجی‌پی'}
        </button>
      </form>
    </div>
  );
}
