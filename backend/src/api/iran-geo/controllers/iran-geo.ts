import { listProvinces, findProvince } from '../../../utils/iran-validation';

export default {
  async list(ctx: any) {
    const provinces = listProvinces().map((p) => ({
      id: p.id,
      name: p.name,
      cities: p.cities.map((c) => c.name),
    }));
    ctx.body = {
      data: {
        country: 'IR',
        countryName: 'ایران',
        provinces,
        addressFields: [
          { key: 'firstName', label: 'نام', required: true },
          { key: 'lastName', label: 'نام خانوادگی', required: true },
          { key: 'province', label: 'استان', required: true },
          { key: 'city', label: 'شهر', required: true },
          { key: 'address', label: 'آدرس', required: true, minLength: 10 },
          { key: 'plaque', label: 'پلاک', required: false },
          { key: 'unit', label: 'واحد', required: false },
          { key: 'postcode', label: 'کد پستی', required: true, pattern: '^\\d{10}$' },
          { key: 'phone', label: 'موبایل', required: true, pattern: '^09\\d{9}$' },
        ],
        validation: {
          mobile: '09xxxxxxxxx یا +989xxxxxxxxx',
          postalCode: '۱۰ رقم کد پستی ایران',
          name: 'نام فارسی حداقل ۲ حرف',
        },
      },
    };
  },

  async province(ctx: any) {
    const name = decodeURIComponent(String(ctx.params.name || ''));
    const p = findProvince(name);
    if (!p) return ctx.notFound('استان یافت نشد');
    ctx.body = {
      data: {
        id: p.id,
        name: p.name,
        cities: p.cities.map((c) => c.name),
      },
    };
  },
};
