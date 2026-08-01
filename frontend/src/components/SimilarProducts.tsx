import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { ProductCard, type ProductCardData } from './ProductCard';

type Props = {
  title?: string;
  products: ProductCardData[];
  onAdd?: (p: ProductCardData) => void;
};

export function SimilarProducts({ title = 'کالاهای مشابه', products, onAdd }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!products.length) return null;

  function scroll(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * -280, behavior: 'smooth' });
  }

  return (
    <section className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <h2 className="text-base font-bold text-[#3f4064] inline-block relative pb-2">
          {title}
          <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[var(--dk-cta)] rounded-full" />
        </h2>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute start-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow border border-gray-100 items-center justify-center hover:bg-[var(--dk-surface)]"
          aria-label="قبلی"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="hidden md:flex absolute end-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow border border-gray-100 items-center justify-center hover:bg-[var(--dk-surface)]"
          aria-label="بعدی"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div
          ref={scroller}
          className="flex gap-0 overflow-x-auto scrollbar-hide snap-x"
        >
          {products.map((p) => (
            <div
              key={String(p.id || p.slug)}
              className="w-[200px] sm:w-[220px] shrink-0 snap-start border-e border-gray-100 last:border-e-0 p-3"
            >
              <ProductCard product={p} onAdd={onAdd ? () => onAdd(p) : undefined} compact />
              <Link
                to={`/product/${p.slug || p.documentId || p.id}`}
                className="sr-only"
              >
                {p.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
