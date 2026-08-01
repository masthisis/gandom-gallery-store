import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/format';
import { ProductCard } from '../ProductCard';
import type { MixedItem } from './types';
import type { ProductCardData } from '../ProductCard';

type Props = {
  title?: string;
  items?: MixedItem[];
  onAdd?: (p: ProductCardData) => void;
};

function imageSrc(img?: string | Record<string, unknown>): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return mediaUrl(img, 'medium');
}

export function MixedSlider({ title, items = [], onAdd }: Props) {
  if (!items.length) return null;

  return (
    <section className="dk-container py-4">
      {title && <h2 className="text-base font-bold mb-3 text-[#3f4064]">{title}</h2>}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, i) => {
          if (item.kind === 'product' && item.product) {
            return (
              <div key={i} className="w-[160px] md:w-[200px] shrink-0">
                <ProductCard product={item.product} onAdd={onAdd ? () => onAdd(item.product) : undefined} compact />
              </div>
            );
          }
          if (item.kind !== 'image') return null;
          const src = imageSrc(item.image);
          const inner = (
            <div className="w-[200px] md:w-[240px] shrink-0 rounded-2xl overflow-hidden bg-[var(--dk-surface)] aspect-[4/3]">
              {src ? (
                <img src={src} alt={item.title || ''} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-[var(--dk-muted)]">
                  {item.title}
                </div>
              )}
            </div>
          );
          return item.link ? (
            <Link key={i} to={item.link}>
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
