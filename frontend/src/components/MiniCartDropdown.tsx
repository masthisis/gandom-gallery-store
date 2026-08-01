import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { formatPrice, toFarsiDigits } from '../lib/format';
import type { CartLine } from './CartDrawer';

type Props = {
  open: boolean;
  items: CartLine[];
  onInc: (id: string | number) => void;
  onDec: (id: string | number) => void;
  onRemove: (id: string | number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function MiniCartDropdown({
  open,
  items,
  onInc,
  onDec,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!open) return null;

  return (
    <div
      className="absolute top-full end-0 pt-2 z-[50]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-[360px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-[#3f4064]">خلاصه سبد خرید شما</span>
          <span className="text-xs text-[var(--dk-muted)]">{toFarsiDigits(count)} کالا</span>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <ShoppingCart className="w-10 h-10 mx-auto text-[var(--dk-muted)] opacity-40 mb-2" />
            <p className="text-sm text-[var(--dk-muted)]">سبد خرید شما خالی است</p>
            <Link
              to="/shop"
              className="inline-block mt-3 text-sm text-[var(--dk-cta)] font-medium hover:underline"
            >
              مشاهده فروشگاه
            </Link>
          </div>
        ) : (
          <>
            <ul className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <div className="w-16 h-16 rounded-lg bg-[var(--dk-surface)] overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--dk-muted)]">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#3f4064] line-clamp-2 leading-6">{item.name}</div>
                    <div className="text-sm font-bold mt-1">{formatPrice(item.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-1">
                        <button
                          type="button"
                          className="p-1.5 text-[var(--dk-cta)]"
                          onClick={() => onInc(item.id)}
                          aria-label="افزایش"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm w-5 text-center font-medium">
                          {toFarsiDigits(item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="p-1.5 text-[var(--dk-cta)]"
                          onClick={() => (item.quantity <= 1 ? onRemove(item.id) : onDec(item.id))}
                          aria-label={item.quantity <= 1 ? 'حذف' : 'کاهش'}
                        >
                          {item.quantity <= 1 ? (
                            <Trash2 className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 p-4 border-t border-gray-100 bg-[#fafafa]">
              <div className="flex-1">
                <div className="text-[11px] text-[var(--dk-muted)] mb-0.5">مبلغ قابل پرداخت</div>
                <div className="font-bold text-[#3f4064] text-sm">{formatPrice(total)}</div>
              </div>
              <Link
                to="/checkout"
                className="shrink-0 bg-[var(--dk-cta)] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90"
              >
                ثبت سفارش
              </Link>
            </div>
            <div className="px-4 pb-3 bg-[#fafafa]">
              <Link
                to="/cart"
                className="block text-center text-xs text-[var(--dk-cta)] font-medium hover:underline py-1"
              >
                مشاهده سبد خرید
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
