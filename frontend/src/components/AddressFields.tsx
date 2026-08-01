import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import {
  EMPTY_ADDRESS,
  validateAddressForm,
  type AddressFormValues,
} from '../lib/iranValidation';

type Province = { id: number; name: string; cities: string[] };

export function AddressFields({
  value,
  onChange,
  disabled,
}: {
  value: AddressFormValues;
  onChange: (next: AddressFormValues) => void;
  disabled?: boolean;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);

  useEffect(() => {
    api
      .iranGeo()
      .then((res) => {
        const list = (res?.data?.provinces || []) as Province[];
        setProvinces(list);
        if (!value.province && list[0]) {
          onChange({ ...value, province: list[0].name, city: list[0].cities[0] || '' });
        }
      })
      .catch(() => setProvinces([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(() => {
    const p = provinces.find((x) => x.name === value.province);
    return p?.cities || [];
  }, [provinces, value.province]);

  function set<K extends keyof AddressFormValues>(key: K, v: AddressFormValues[K]) {
    if (key === 'province') {
      const p = provinces.find((x) => x.name === v);
      onChange({ ...value, province: String(v), city: p?.cities[0] || '' });
      return;
    }
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input
          required
          disabled={disabled}
          placeholder="نام"
          className="border rounded-lg px-3 py-2"
          value={value.firstName}
          onChange={(e) => set('firstName', e.target.value)}
        />
        <input
          required
          disabled={disabled}
          placeholder="نام خانوادگی"
          className="border rounded-lg px-3 py-2"
          value={value.lastName}
          onChange={(e) => set('lastName', e.target.value)}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <select
          required
          disabled={disabled}
          className="border rounded-lg px-3 py-2"
          value={value.province}
          onChange={(e) => set('province', e.target.value)}
        >
          <option value="">انتخاب استان</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          required
          disabled={disabled}
          className="border rounded-lg px-3 py-2"
          value={value.city}
          onChange={(e) => set('city', e.target.value)}
        >
          <option value="">انتخاب شهر</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <textarea
        required
        disabled={disabled}
        placeholder="آدرس دقیق (خیابان، کوچه...)"
        className="border rounded-lg px-3 py-2"
        rows={2}
        value={value.address}
        onChange={(e) => set('address', e.target.value)}
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          disabled={disabled}
          placeholder="پلاک"
          className="border rounded-lg px-3 py-2"
          value={value.plaque}
          onChange={(e) => set('plaque', e.target.value)}
        />
        <input
          disabled={disabled}
          placeholder="واحد"
          className="border rounded-lg px-3 py-2"
          value={value.unit}
          onChange={(e) => set('unit', e.target.value)}
        />
        <input
          required
          disabled={disabled}
          placeholder="کد پستی ۱۰ رقمی"
          dir="ltr"
          className="border rounded-lg px-3 py-2"
          value={value.postcode}
          onChange={(e) => set('postcode', e.target.value)}
          maxLength={10}
        />
      </div>
      <input
        required
        disabled={disabled}
        placeholder="موبایل ۰۹xxxxxxxxx"
        dir="ltr"
        className="border rounded-lg px-3 py-2"
        value={value.phone}
        onChange={(e) => set('phone', e.target.value)}
      />
    </div>
  );
}

export function useAddressValidation(form: AddressFormValues, provinces: Province[]) {
  const cities = provinces.find((p) => p.name === form.province)?.cities || [];
  return validateAddressForm(form, cities);
}

export { EMPTY_ADDRESS };
