import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { mediaUrl } from '../../lib/format';
import type { SlideItem } from './types';

type Props = {
  slides?: SlideItem[];
  autoPlayMs?: number;
};

function slideImage(slide: SlideItem): string | null {
  if (!slide.image) return null;
  if (typeof slide.image === 'string') return slide.image;
  return mediaUrl(slide.image, 'large');
}

export function HeroSlider({ slides = [], autoPlayMs = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const items = slides.length
    ? slides
    : [{ title: 'گندم گالری', subtitle: 'مجموعه‌ای منتخب از دکوری و هنری', link: '/shop' }];

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), autoPlayMs);
    return () => clearInterval(t);
  }, [items.length, autoPlayMs]);

  const current = items[index];
  const img = current ? slideImage(current) : null;
  const href = current?.link || '/shop';

  return (
    <section className="dk-container py-3">
      <div className="relative rounded-2xl overflow-hidden bg-[var(--dk-surface)] aspect-[16/10] sm:aspect-[2.4/1] md:aspect-[3.2/1]">
        {items.map((slide, i) => {
          const src = slideImage(slide);
          const active = i === index;
          return (
            <Link
              key={i}
              to={slide.link || '/shop'}
              className={`absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              tabIndex={active ? 0 : -1}
              aria-hidden={!active}
            >
              {src ? (
                <img
                  src={src}
                  alt={slide.title || ''}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-l from-[#3f4064] to-[var(--dk-cta)] flex items-end sm:items-center">
                  <div className="p-5 sm:p-8 md:p-12 text-white max-w-lg pb-14 sm:pb-8">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                    {slide.subtitle && (
                      <p className="text-white/85 text-xs sm:text-sm md:text-base line-clamp-2">{slide.subtitle}</p>
                    )}
                  </div>
                </div>
              )}
              {src && (slide.title || slide.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end">
                  <div className="p-6 md:p-8 text-white">
                    {slide.title && <h2 className="text-xl md:text-3xl font-bold">{slide.title}</h2>}
                    {slide.subtitle && <p className="text-white/85 text-sm mt-1">{slide.subtitle}</p>}
                  </div>
                </div>
              )}
            </Link>
          );
        })}

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
              className="absolute top-1/2 -translate-y-1/2 start-3 z-20 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
              aria-label="قبلی"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % items.length)}
              className="absolute top-1/2 -translate-y-1/2 end-3 z-20 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
              aria-label="بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${i === index ? 'bg-white w-5' : 'bg-white/50'}`}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {!img && items.length === 1 && (
          <Link
            to={href}
            className="absolute bottom-4 start-5 sm:bottom-6 sm:start-8 z-20 bg-white text-[var(--dk-cta)] font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm"
          >
            مشاهده فروشگاه
          </Link>
        )}
      </div>
    </section>
  );
}
