/** Iranian mobile / postal / name validation (mirrors backend) */

const PERSIAN_NAME =
  /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s‌‍]+$/u;

export type AddressFormValues = {
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  address: string;
  plaque: string;
  unit: string;
  postcode: string;
  phone: string;
};

export function toAsciiDigits(input: string): string {
  return String(input || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

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
  return /^\d{10}$/.test(s) && !/^0+$/.test(s);
}

export function isValidPersianName(raw: string): boolean {
  const s = String(raw || '').trim();
  return s.length >= 2 && s.length <= 40 && PERSIAN_NAME.test(s);
}

export function validateAddressForm(
  form: AddressFormValues,
  citiesForProvince: string[]
): string[] {
  const errors: string[] = [];
  if (!isValidPersianName(form.firstName)) errors.push('نام باید فارسی و حداقل ۲ حرف باشد');
  if (!isValidPersianName(form.lastName)) errors.push('نام خانوادگی باید فارسی و حداقل ۲ حرف باشد');
  if (!form.province) errors.push('استان را انتخاب کنید');
  if (!form.city || !citiesForProvince.includes(form.city)) errors.push('شهر معتبر انتخاب کنید');
  if (form.address.trim().length < 10) errors.push('آدرس باید حداقل ۱۰ کاراکتر باشد');
  if (!isValidIranPostalCode(form.postcode)) errors.push('کد پستی باید دقیقاً ۱۰ رقم باشد');
  if (!normalizeIranMobile(form.phone)) errors.push('موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
  return errors;
}

export const EMPTY_ADDRESS: AddressFormValues = {
  firstName: '',
  lastName: '',
  province: '',
  city: '',
  address: '',
  plaque: '',
  unit: '',
  postcode: '',
  phone: '',
};
