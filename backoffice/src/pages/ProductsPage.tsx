import { useEffect, useState } from 'react';
import { adminApi, formatToman, listOf } from '../lib/api';

export function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    price: '',
    sale_price: '',
    stock_quantity: '10',
    description: '',
    sku: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.products();
      setProducts(listOf(res));
      setError('');
    } catch (err: any) {
      setProducts([]);
      setError(err.message || 'خطا در بارگذاری کالاها');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const slug =
        form.slug ||
        form.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') ||
        `product-${Date.now()}`;
      await adminApi.createProduct({
        name: form.name,
        slug,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock_quantity: Number(form.stock_quantity),
        stock_status: 'in_stock',
        description: form.description,
        sku: form.sku || `SKU-${Date.now()}`,
      });
      setOpen(false);
      setForm({ name: '', slug: '', price: '', sale_price: '', stock_quantity: '10', description: '', sku: '' });
      await load();
    } catch (err: any) {
      setError(err.message || 'خطا در ایجاد کالا — از Strapi Admin هم می‌توانید استفاده کنید');
    }
  }

  async function remove(id: string) {
    if (!confirm('حذف شود؟')) return;
    try {
      await adminApi.deleteProduct(id);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">کالاها</h1>
        <button onClick={() => setOpen(true)} className="bg-[#ef4056] text-white px-4 py-2 rounded-lg text-sm">
          کالای جدید
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-right p-3">نام</th>
              <th className="text-right p-3">قیمت</th>
              <th className="text-right p-3">موجودی</th>
              <th className="text-right p-3">slug</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id || p.documentId} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{formatToman(p.sale_price ?? p.price)}</td>
                <td className="p-3">{p.stock_quantity}</td>
                <td className="p-3 dir-ltr text-xs text-gray-500">{p.slug}</td>
                <td className="p-3">
                  <button
                    className="text-red-600 text-xs"
                    onClick={() => remove(p.documentId || p.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-gray-500">در حال بارگذاری…</p>}
        {!loading && error && <p className="p-6 text-center text-red-600">{error}</p>}
        {!loading && !error && !products.length && (
          <p className="p-6 text-center text-gray-500">کالایی نیست — seed یا ایجاد کنید</p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form onSubmit={create} className="relative bg-white rounded-2xl p-6 w-full max-w-lg space-y-3">
            <h2 className="font-bold text-lg">کالای جدید</h2>
            <input
              required
              className="w-full border rounded-lg px-3 py-2"
              placeholder="نام فارسی"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="slug لاتین (اختیاری)"
              dir="ltr"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                className="border rounded-lg px-3 py-2"
                placeholder="قیمت تومان"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="قیمت فروش ویژه"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="موجودی"
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              placeholder="توضیحات"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full bg-[#ef4056] text-white rounded-lg py-2.5">ذخیره</button>
          </form>
        </div>
      )}
    </div>
  );
}
