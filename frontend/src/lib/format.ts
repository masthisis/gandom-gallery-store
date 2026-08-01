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

export type MediaSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

const FORMAT_PREF: Record<MediaSize, string[]> = {
  thumbnail: ['thumbnail', 'small', 'medium', 'large'],
  small: ['small', 'thumbnail', 'medium', 'large'],
  medium: ['medium', 'small', 'large', 'thumbnail'],
  large: ['large', 'medium', 'small', 'thumbnail'],
  original: [],
};

function pickFormatUrl(
  formats: Record<string, { url?: string }> | undefined,
  size: MediaSize
): string | null {
  if (!formats) return null;
  for (const key of FORMAT_PREF[size]) {
    const u = formats[key]?.url;
    if (u) return u;
  }
  return null;
}

export function mediaUrl(img: unknown, size: MediaSize = 'medium'): string | null {
  if (!img) return null;

  let url: string | null = null;
  if (typeof img === 'string') {
    url = img;
  } else {
    const media = img as { url?: string; formats?: Record<string, { url?: string }> };
    if (size === 'original') {
      url = media.url || pickFormatUrl(media.formats, 'large');
    } else {
      url = pickFormatUrl(media.formats, size) || media.url || null;
    }
  }
  if (!url) return null;

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:1337').replace(/\/$/, '');

  // Absolute URL wrongly pointed at the storefront → rewrite to API
  try {
    const u = new URL(url, apiBase);
    if (u.pathname.startsWith('/uploads/')) {
      const host = u.hostname;
      const apiHost = new URL(apiBase).hostname;
      if (host !== apiHost || !url.startsWith('http')) {
        return `${apiBase}${u.pathname}${u.search}`;
      }
    }
  } catch {
    /* relative path */
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!url.startsWith('/')) url = `/${url}`;
  return `${apiBase}${url}`;
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
