import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Store,
  Eye
} from 'lucide-react';

interface BackofficeOrder {
  id: string;
  customer: string;
  phone: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped';
  date: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  const [products, setProducts] = useState([
    { id: 1, titleFa: 'گوشی موبایل اپل مدل iPhone 15 Pro Max', price: 68500000, stock: 8, category: 'موبایل' },
    { id: 2, titleFa: 'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra', price: 62000000, stock: 12, category: 'موبایل' },
    { id: 3, titleFa: 'لپ تاپ ۱۶ اینچی اپل مدل MacBook Pro M3', price: 125000000, stock: 5, category: 'لپ‌تاپ' },
    { id: 4, titleFa: 'هدفون بی‌سیم سونی مدل WH-1000XM5', price: 18500000, stock: 15, category: 'لوازم جانبی' }
  ]);

  const [orders, setOrders] = useState<BackofficeOrder[]>([
    { id: 'DK-9041', customer: 'علی رضایی', phone: '09123456789', total: 64900000, status: 'processing', date: '۱۴۰۳/۰۵/۰۷' },
    { id: 'DK-9042', customer: 'مریم کمالی', phone: '09198765432', total: 16900000, status: 'pending', date: '۱۴۰۳/۰۵/۰۷' },
    { id: 'DK-9040', customer: 'حسین احمدی', phone: '09351112233', total: 119000000, status: 'shipped', date: '۱۴۰۳/۰۵/۰۶' }
  ]);

  const [newProduct, setNewProduct] = useState({ titleFa: '', price: '', stock: '', category: 'موبایل' });
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.titleFa || !newProduct.price) return;
    setProducts([
      ...products,
      {
        id: Date.now(),
        titleFa: newProduct.titleFa,
        price: parseInt(newProduct.price),
        stock: parseInt(newProduct.stock) || 1,
        category: newProduct.category
      }
    ]);
    setShowAddModal(false);
    setNewProduct({ titleFa: '', price: '', stock: '', category: 'موبایل' });
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'pending' | 'processing' | 'shipped') => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const formatToman = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';

  return (
    <div className="min-h-screen bg-gray-50 flex font-vazir text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 p-6 flex flex-col justify-between border-l border-slate-800">
        <div>
          {/* Shop Owner Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-600 p-2.5 rounded-xl text-white">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">پنل مدیریت فروشنده</h2>
              <p className="text-[11px] text-slate-400">گندم گالری | دیجی‌کالا</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>داشبورد و آمار فروش</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'products' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>مدیریت کالاها و انبار</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'orders' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>سفارشات مشتریان</span>
            </button>
          </nav>
        </div>

        {/* Footer / Storefront Link */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-2 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-400" />
              <span>مشاهده فروشگاه</span>
            </span>
            <span className="text-[10px] text-slate-500">↗</span>
          </a>

          <button className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 w-full px-2 py-1">
            <LogOut className="w-4 h-4" />
            <span>خروج از پنل</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-xl font-black text-gray-900">خلاصه وضعیت و آمار فروشگاه</h1>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">کل درآمد فروش</span>
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-lg font-black text-gray-900">{formatToman(265300000)}</div>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">٪۱۲+ نسبت به ماه قبل</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">سفارشات جدید</span>
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-lg font-black text-gray-900">۲۸ سفارش</div>
                <span className="text-[11px] text-blue-600 font-bold mt-1 inline-block">۴ سفارش در انتظار پردازش</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">تعداد کالاها</span>
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-lg font-black text-gray-900">{products.length} محصول</div>
                <span className="text-[11px] text-purple-600 font-bold mt-1 inline-block">موجود در انبار</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">رضایت مشتریان</span>
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-lg font-black text-gray-900">۹۸.۵٪</div>
                <span className="text-[11px] text-amber-600 font-bold mt-1 inline-block">بر اساس ۱۴۲ نظر</span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">آخرین سفارش‌های دریافتی</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                      <th className="py-3 px-4">کد سفارش</th>
                      <th className="py-3 px-4">نام خریدار</th>
                      <th className="py-3 px-4">شماره تماس</th>
                      <th className="py-3 px-4">مبلغ کل</th>
                      <th className="py-3 px-4">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">{o.id}</td>
                        <td className="py-3 px-4">{o.customer}</td>
                        <td className="py-3 px-4">{o.phone}</td>
                        <td className="py-3 px-4 font-bold">{formatToman(o.total)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              o.status === 'processing'
                                ? 'bg-amber-50 text-amber-700'
                                : o.status === 'shipped'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {o.status === 'processing'
                              ? 'در حال پردازش'
                              : o.status === 'shipped'
                              ? 'ارسال شده'
                              : 'در انتظار پرداخت'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-gray-900">مدیریت کالاهای فروشگاه</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن محصول جدید</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">عنوان محصول (فارسی)</th>
                    <th className="py-3.5 px-4">دسته‌بندی</th>
                    <th className="py-3.5 px-4">قیمت فروش</th>
                    <th className="py-3.5 px-4">موجودی انبار</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{p.titleFa}</td>
                      <td className="py-3.5 px-4">{p.category}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{formatToman(p.price)}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">
                          {p.stock} عدد
                        </span>
                      </td>
                      <td className="py-3.5 px-4 flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProducts(products.filter(item => item.id !== p.id))}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-xl font-black text-gray-900">مدیریت سفارشات مشتریان</h1>

            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-base text-gray-900">{o.id}</span>
                      <span className="text-xs text-gray-400">ثبت در {o.date}</span>
                    </div>
                    <p className="text-xs text-gray-600">خریدار: {o.customer} ({o.phone})</p>
                    <p className="text-xs font-bold text-gray-800 mt-2">مبلغ سفارش: {formatToman(o.total)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'processing')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        o.status === 'processing' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      در حال پردازش
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        o.status === 'shipped' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      تحویل به پست
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">
                افزودن محصول جدید به انبار
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">عنوان فارسی محصول</label>
                  <input
                    type="text"
                    required
                    value={newProduct.titleFa}
                    onChange={(e) => setNewProduct({ ...newProduct, titleFa: e.target.value })}
                    placeholder="مثال: گوشی موبایل شیائومی 13T Pro"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">قیمت (تومان)</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="مثال: 32000000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">موجودی انبار</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="10"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                  >
                    ثبت و ذخیره
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
