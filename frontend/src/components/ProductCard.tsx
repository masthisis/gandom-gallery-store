import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { formatPrice, mediaUrl, toFarsiDigits } from '../lib/format';

export type ProductCardData = {
  id?: number | string;
  documentId?: string;
  slug?: string;
  name: string;
  price: number;
  sale_price?: number | null;
  images?: unknown;
  gallery_urls?: string[];
  specifications?: { label: string; value: string }[];
};

const PALETTE = ['#ef4056', '#39ae00', '#3f4064', '#19bfd3', '#f9a825', '#ed1944'];

function placeholderDataUri(seed: string, title: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const c = PALETTE[hash % PALETTE.length];
  const label = (title || 'گندم').slice(0, 12);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#f0f0f1"/>
    </linearGradient></defs>
    <rect width="800" height="800" fill="url(#g)"/>
    <circle cx="400" cy="340" r="110" fill="${c}" opacity="0.22"/>
    <text x="400" y="560" text-anchor="middle" font-family="Tahoma,sans-serif" font-size="42" fill="#424750">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolveImage(product: ProductCardData): string {
  const raw = Array.isArray(product.images) ? product.images[0] : product.images;
  const url = raw ? mediaUrl(raw, 'small') : null;
  if (url) return url;
  if (Array.isArray(product.gallery_urls) && product.gallery_urls[0]) {
    return String(product.gallery_urls[0]);
  }
  const seed = String(product.slug || product.id || product.name || 'p');
  return placeholderDataUri(seed, product.name);
}

function discountPercent(price: number, salePrice: number): number {
  if (!price || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function ProductCard({
  product,
  onAdd,
  compact = false,
}: {
  product: ProductCardData;
  onAdd?: () => void;
  compact?: boolean;
}) {
  const href = `/product/${product.slug || product.documentId || product.id}`;
  const fallback = useMemo(() => resolveImage(product), [product]);
  const [img, setImg] = useState(fallback);
  const price = Number(product.price) || 0;
  const salePrice = product.sale_price != null ? Number(product.sale_price) : null;
  const hasSale = salePrice != null && salePrice < price;
  const pct = hasSale ? discountPercent(price, salePrice!) : 0;

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full group">
      <Link to={href} className="block relative aspect-square overflow-hidden bg-[var(--dk-surface)] p-3">
        {hasSale && pct > 0 && (
          <span className="absolute top-2 start-2 z-10 bg-[var(--dk-cta)] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            {toFarsiDigits(pct)}٪
          </span>
        )}
        <img
          src={img}
          alt=""
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          onError={() => setImg(placeholderDataUri(String(product.slug || 'p'), product.name))}
        />
      </Link>
      <div className={`flex flex-col gap-1.5 flex-1 ${compact ? 'p-2.5' : 'p-3'}`}>
        <Link
          to={href}
          className={`font-normal text-[#3f4064] line-clamp-2 hover:text-[var(--dk-cta)] ${compact ? 'text-xs min-h-[2rem]' : 'text-sm min-h-[2.5rem]'}`}
        >
          {product.name}
        </Link>
        <div className="mt-auto flex flex-col gap-0.5">
          {hasSale ? (
            <>
              <span className={`text-[var(--dk-muted)] line-through ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {formatPrice(price)}
              </span>
              <span className={`text-[#3f4064] font-bold ${compact ? 'text-sm' : 'text-base'}`}>
                {formatPrice(salePrice)}
              </span>
            </>
          ) : (
            <span className={`text-[#3f4064] font-bold ${compact ? 'text-sm' : 'text-base'}`}>
              {formatPrice(price)}
            </span>
          )}
        </div>
        {onAdd && !compact && (
          <button
            type="button"
            onClick={onAdd}
            className="w-full mt-1 text-sm border border-[var(--dk-cta)] text-[var(--dk-cta)] rounded-lg py-2 hover:bg-[#fff0f2] transition"
          >
            افزودن به سبد
          </button>
        )}
      </div>
    </article>
  );
}
