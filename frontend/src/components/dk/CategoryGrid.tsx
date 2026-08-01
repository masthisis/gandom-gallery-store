import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/format';
import type { CategoryItem } from './types';

type Props = {
  categories?: CategoryItem[];
  title?: string;
};

function catImage(c: CategoryItem): string {
  if (!c.image) return '/placeholders/product.svg';
  if (typeof c.image === 'string') return c.image;
  return mediaUrl(c.image) || '/placeholders/product.svg';
}

export function CategoryGrid({ categories = [], title }: Props) {
  if (!categories.length) return null;

  return (
    <section className="dk-container py-4">
      {title && <h2 className="text-base font-bold mb-4 text-[#3f4064]">{title}</h2>}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/category/${c.slug}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-[var(--dk-surface)] group-hover:ring-2 ring-[var(--dk-cta)] transition">
              <img src={catImage(c)} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <span className="text-xs text-center line-clamp-2 text-[#3f4064] group-hover:text-[var(--dk-cta)]">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
