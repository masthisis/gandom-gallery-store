import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatPrice, toFarsiDigits } from '../lib/format';
import { Link } from 'react-router-dom';

export type CartLine = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: CartLine[];
  onInc: (id: string | number) => void;
  onDec: (id: string | number) => void;
  onRemove: (id: string | number) => void;
};

export function CartDrawer({ open, onClose, items, onInc, onDec, onRemove }: Props) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--dk-cta)]" />
            <h2 className="font-bold text-base text-[#3f4064]">
              سبد خرید
              {count > 0 && (
                <span className="text-sm font-normal text-[var(--dk-muted)] ms-2">
                  ({toFarsiDigits(count)} کالا)
                </span>
              )}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--dk-surface)]" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-[var(--dk-muted)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--dk-muted)] text-sm">سبد خرید شما خالی است</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 bg-[var(--dk-surface)] rounded-xl p-3">
              <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--dk-muted)]">—</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#3f4064] line-clamp-2">{item.name}</div>
                <div className="text-[var(--dk-cta)] text-sm font-bold mt-1">{formatPrice(item.price)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button type="button" className="p-1 bg-white rounded border" onClick={() => onDec(item.id)}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm w-6 text-center">{toFarsiDigits(item.quantity)}</span>
                  <button type="button" className="p-1 bg-white rounded border" onClick={() => onInc(item.id)}>
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    className="text-xs text-[var(--dk-muted)] hover:text-red-600 ms-auto"
                    onClick={() => onRemove(item.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t bg-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--dk-muted)]">مبلغ قابل پرداخت</span>
              <span className="font-bold text-[#3f4064]">{formatPrice(total)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block text-center bg-[var(--dk-cta)] text-white rounded-xl py-3 text-sm font-medium hover:opacity-90"
            >
              ثبت سفارش
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="block text-center border border-[var(--dk-cta)] text-[var(--dk-cta)] rounded-xl py-2.5 text-sm font-medium hover:bg-[#fff0f2]"
            >
              مشاهده سبد خرید
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
