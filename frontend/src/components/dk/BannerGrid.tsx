import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/format';
import type { BannerItem } from './types';

type Props = {
  banners?: BannerItem[];
  title?: string;
};

function bannerImage(b: BannerItem): string | null {
  if (!b.image) return null;
  if (typeof b.image === 'string') return b.image;
  return mediaUrl(b.image, 'medium');
}

export function BannerGrid({ banners = [], title }: Props) {
  if (!banners.length) return null;

  const cols =
    banners.length === 1 ? 1 : banners.length === 2 ? 2 : banners.length <= 4 ? 2 : 3;

  return (
    <section className="dk-container py-4">
      {title && <h2 className="text-base font-bold mb-3 text-[#3f4064]">{title}</h2>}
      <div
        className={`grid gap-3 ${
          cols === 1
            ? 'grid-cols-1'
            : cols === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {banners.map((b, i) => {
          const src = bannerImage(b);
          const content = (
            <div className="relative rounded-2xl overflow-hidden bg-[var(--dk-surface)] aspect-[2.2/1]">
              {src ? (
                <img src={src} alt={b.title || ''} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--dk-muted)] text-sm">
                  {b.title || 'بنر'}
                </div>
              )}
            </div>
          );
          return b.link ? (
            <Link key={i} to={b.link}>
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
