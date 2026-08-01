import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice, toFarsiDigits } from '../lib/format';
import type { CartLine } from '../components/CartDrawer';

export function CartPage({
  items,
  onInc,
  onDec,
  onRemove,
}: {
  items: CartLine[];
  onInc: (id: string | number) => void;
  onDec: (id: string | number) => void;
  onRemove: (id: string | number) => void;
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = items.length ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="dk-container py-6">
      <nav className="mb-4 text-xs text-[var(--dk-muted)]">
        <Link to="/" className="hover:text-[var(--dk-cta)]">فروشگاه</Link>
        <span className="mx-1">/</span>
        <span className="text-[#3f4064] font-medium">سبد خرید</span>
      </nav>
      <h1 className="text-xl font-bold text-[#3f4064] mb-6">سبد خرید</h1>

      {!items.length ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <p className="text-[var(--dk-muted)] mb-4">سبد خرید شما خالی است</p>
          <Link to="/shop" className="inline-block bg-[var(--dk-cta)] text-white px-6 py-2.5 rounded-xl text-sm font-medium">
            شروع خرید
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
                <div className="w-20 h-20 rounded-xl bg-[var(--dk-surface)] shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--dk-muted)] text-xs">بدون تصویر</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[#3f4064] line-clamp-2">{item.name}</div>
                  <div className="text-[var(--dk-cta)] text-sm font-bold mt-1">{formatPrice(item.price)}</div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button type="button" className="p-2 hover:bg-[var(--dk-surface)]" onClick={() => onDec(item.id)}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{toFarsiDigits(item.quantity)}</span>
                      <button type="button" className="p-2 hover:bg-[var(--dk-surface)]" onClick={() => onInc(item.id)}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-[var(--dk-muted)] hover:text-red-600 p-1"
                      onClick={() => onRemove(item.id)}
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-bold text-[#3f4064] shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24 space-y-4">
              <h2 className="font-bold text-[#3f4064]">خلاصه سفارش</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--dk-muted)]">
                  <span>قیمت کالاها ({toFarsiDigits(items.reduce((s, i) => s + i.quantity, 0))})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--dk-muted)]">
                  <span>هزینه ارسال</span>
                  <span className="text-[#39ae00]">{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-[#3f4064]">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block text-center bg-[var(--dk-cta)] text-white py-3 rounded-xl font-medium hover:opacity-90"
              >
                ثبت سفارش
              </Link>
              <Link to="/shop" className="block text-center text-sm text-[var(--dk-cta)]">
                ادامه خرید
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
