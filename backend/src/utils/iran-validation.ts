/**
 * Iranian address & phone validation (production rules).
 * Mobile: 09xxxxxxxxx | +989xxxxxxxxx | 00989xxxxxxxxx
 * Postal: exactly 10 digits (Iran Post)
 */

import iranGeo from '../data/iran-geo.json';

const PERSIAN_NAME =
  /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s‌‍]+$/u;

export type AddressInput = {
  firstName?: string;
  lastName?: string;
  province?: string;
  city?: string;
  address?: string;
  plaque?: string;
  unit?: string;
  postcode?: string;
  phone?: string;
};

export function toAsciiDigits(input: string): string {
  return String(input || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** Normalize IR mobile to 09xxxxxxxxx or null */
export function normalizeIranMobile(raw: string): string | null {
  let s = toAsciiDigits(raw).replace(/[\s\-()]/g, '');
  if (s.startsWith('+98')) s = `0${s.slice(3)}`;
  if (s.startsWith('0098')) s = `0${s.slice(4)}`;
  if (s.startsWith('98') && s.length === 12) s = `0${s.slice(2)}`;
  if (!/^09\d{9}$/.test(s)) return null;
  return s;
}

export function isValidIranPostalCode(raw: string): boolean {
  const s = toAsciiDigits(raw).replace(/\s/g, '');
  if (!/^\d{10}$/.test(s)) return false;
  if (/^0+$/.test(s)) return false;
  return true;
}

export function isValidPersianName(raw: string, min = 2, max = 40): boolean {
  const s = String(raw || '').trim();
  if (s.length < min || s.length > max) return false;
  return PERSIAN_NAME.test(s);
}

export function listProvinces(): { id: number; name: string; cities: { name: string }[] }[] {
  return (iranGeo as any).provinces || [];
}

export function findProvince(name: string) {
  const n = String(name || '').trim();
  return listProvinces().find((p) => p.name === n) || null;
}

export function cityBelongsToProvince(province: string, city: string): boolean {
  const p = findProvince(province);
  if (!p) return false;
  const c = String(city || '').trim();
  return p.cities.some((x) => x.name === c);
}

export function validateAddressParts(input: AddressInput): { ok: true; data: Required<AddressInput> } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const firstName = String(input.firstName || '').trim();
  const lastName = String(input.lastName || '').trim();
  const province = String(input.province || '').trim();
  const city = String(input.city || '').trim();
  const address = String(input.address || '').trim();
  const plaque = String(input.plaque || '').trim();
  const unit = String(input.unit || '').trim();
  const postcode = toAsciiDigits(String(input.postcode || '')).replace(/\s/g, '');
  const phoneNorm = normalizeIranMobile(String(input.phone || ''));

  if (!isValidPersianName(firstName)) errors.push('نام باید فارسی و حداقل ۲ حرف باشد');
  if (!isValidPersianName(lastName)) errors.push('نام خانوادگی باید فارسی و حداقل ۲ حرف باشد');
  if (!findProvince(province)) errors.push('استان نامعتبر است');
  else if (!cityBelongsToProvince(province, city)) errors.push('شهر با استان هم‌خوانی ندارد');
  if (address.length < 10) errors.push('آدرس باید حداقل ۱۰ کاراکتر باشد');
  if (address.length > 300) errors.push('آدرس بیش از حد طولانی است');
  if (plaque && !/^[\d\u06F0-\u06F9A-Za-z\/\-]{1,12}$/.test(toAsciiDigits(plaque))) {
    errors.push('پلاک نامعتبر است');
  }
  if (unit && unit.length > 12) errors.push('واحد نامعتبر است');
  if (!isValidIranPostalCode(postcode)) errors.push('کد پستی باید دقیقاً ۱۰ رقم باشد');
  if (!phoneNorm) errors.push('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      province,
      city,
      address,
      plaque,
      unit,
      postcode,
      phone: phoneNorm!,
    },
  };
}

export function toWcAddress(data: Required<AddressInput>, type = 1) {
  const street = [data.address, data.plaque ? `پلاک ${data.plaque}` : '', data.unit ? `واحد ${data.unit}` : '']
    .filter(Boolean)
    .join('، ');
  return {
    type,
    first_name: data.firstName,
    last_name: data.lastName,
    country: 'IR',
    region: data.province,
    city: data.city,
    street_address: street,
    postcode: data.postcode,
    phone: data.phone,
  };
}
