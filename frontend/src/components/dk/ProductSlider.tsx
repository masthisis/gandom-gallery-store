import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import type { ProductCardData } from '../ProductCard';

type Props = {
  title?: string;
  products?: ProductCardData[];
  link?: string;
  limit?: number;
  onAdd?: (p: ProductCardData) => void;
};

export function ProductSlider({ title, products = [], link = '/shop', limit = 12, onAdd }: Props) {
  const list = products.slice(0, limit);
  if (!list.length) return null;

  return (
    <section className="dk-container py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-bold text-[#3f4064]">{title || 'محصولات'}</h2>
        <Link to={link} className="flex items-center gap-1 text-sm text-[var(--dk-cta)] hover:opacity-80">
          مشاهده همه
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {list.map((p) => (
          <div key={p.id || p.slug} className="w-[148px] sm:w-[160px] md:w-[200px] shrink-0">
            <ProductCard product={p} onAdd={onAdd ? () => onAdd(p) : undefined} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
