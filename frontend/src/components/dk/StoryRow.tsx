import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/format';
import type { StoryItem } from './types';

type Props = {
  items?: StoryItem[];
  title?: string;
};

function storyImage(item: StoryItem): string {
  if (!item.image) return '/placeholders/product.svg';
  if (typeof item.image === 'string') return item.image;
  return mediaUrl(item.image, 'thumbnail') || '/placeholders/product.svg';
}

export function StoryRow({ items = [], title }: Props) {
  if (!items.length) return null;

  return (
    <section className="dk-container py-4">
      {title && <h2 className="text-base font-bold mb-3 text-[#3f4064]">{title}</h2>}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.link || '/shop'}
            className="flex flex-col items-center gap-2 shrink-0 w-[72px] md:w-[84px]"
          >
            <div className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-full overflow-hidden border-2 border-[var(--dk-cta)] p-0.5 bg-white">
              <img
                src={storyImage(item)}
                alt={item.title || ''}
                className="w-full h-full rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="text-xs text-center line-clamp-2 text-[#3f4064]">{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
