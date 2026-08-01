import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { toFarsiDigits } from '../../lib/format';
import type { ProductCardData } from '../ProductCard';

type Props = {
  title?: string;
  products?: ProductCardData[];
  endsAt?: string;
  limit?: number;
  onAdd?: (p: ProductCardData) => void;
};

function useCountdown(endsAt?: string) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft({ h, m, s });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return left;
}

function pad(n: number) {
  return toFarsiDigits(String(n).padStart(2, '0'));
}

export function IncredibleOffers({ title, products = [], endsAt, limit = 12, onAdd }: Props) {
  const countdown = useCountdown(endsAt);
  const list = products.slice(0, limit);
  if (!list.length) return null;

  return (
    <section className="dk-container py-4">
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="bg-[var(--dk-cta)] text-white p-5 md:p-6 flex flex-col justify-center items-center md:items-start md:w-48 shrink-0 gap-3">
          <h2 className="text-lg font-bold">{title || 'پیشنهاد شگفت‌انگیز'}</h2>
          {endsAt && (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span className="bg-white/20 rounded px-2 py-1">{pad(countdown.h)}</span>
              <span>:</span>
              <span className="bg-white/20 rounded px-2 py-1">{pad(countdown.m)}</span>
              <span>:</span>
              <span className="bg-white/20 rounded px-2 py-1">{pad(countdown.s)}</span>
            </div>
          )}
          <Link to="/shop?sort=sale" className="flex items-center gap-1 text-sm text-white/90 hover:text-white mt-1">
            مشاهده همه
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex-1 overflow-x-auto p-4 flex gap-3 scrollbar-hide">
          {list.map((p) => (
            <div key={p.id || p.slug} className="w-[160px] md:w-[180px] shrink-0">
              <ProductCard product={p} onAdd={onAdd ? () => onAdd(p) : undefined} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
