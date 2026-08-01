export function toFarsiDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

export function formatPrice(toman: number | string | null | undefined): string {
  const n = Math.round(Number(toman) || 0);
  const formatted = new Intl.NumberFormat('fa-IR').format(n);
  return `${formatted} تومان`;
}

export const ORDER_STATUS_FA: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
  refunded: 'بازگشت وجه',
};

export const PAYMENT_STATUS_FA: Record<string, string> = {
  pending: 'پرداخت نشده',
  paid: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'مسترد شده',
};

export function mediaUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img;
  const url = img.url || img?.formats?.medium?.url || img?.formats?.small?.url;
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:1337';
  return `${base}${url}`;
}

/** Map Iranian address form → WebbyCommerce address fields */
export function toPluginAddress(form: {
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  address: string;
  plaque?: string;
  unit?: string;
  postcode: string;
  phone: string;
  type?: number;
}) {
  const street = [form.address, form.plaque ? `پلاک ${form.plaque}` : '', form.unit ? `واحد ${form.unit}` : '']
    .filter(Boolean)
    .join('، ');
  return {
    type: form.type ?? 1,
    first_name: form.firstName,
    last_name: form.lastName,
    country: 'IR',
    region: form.province,
    city: form.city,
    street_address: street,
    postcode: form.postcode,
    phone: form.phone,
  };
}
