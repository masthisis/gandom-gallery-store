import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, X } from 'lucide-react';
import { getProducts } from '../lib/catalog';
import { formatPrice, mediaUrl } from '../lib/format';

const POPULAR = ['گلدان', 'تابلو', 'شمع', 'هدیه', 'دکوری', 'سرامیک'];

type ProductHit = {
  id?: number | string;
  documentId?: string;
  slug?: string;
  name: string;
  price?: number;
  sale_price?: number | null;
  images?: unknown;
};

function normalizeList(res: unknown): ProductHit[] {
  if (Array.isArray(res)) return res as ProductHit[];
  const r = res as { data?: ProductHit[]; products?: ProductHit[] };
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.products)) return r.products;
  return [];
}

type Props = {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  onSubmit: (q: string) => void;
};

export function SearchDropdown({ open, query, onQueryChange, onClose, onSubmit }: Props) {
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState<ProductHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    getProducts()
      .then((res) => setAll(normalizeList(res)))
      .catch(() => setAll([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const q = query.trim();

  useEffect(() => {
    if (!open) return;
    if (!q) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(() => {
      const lower = q.toLowerCase();
      const filtered = all.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.slug?.toLowerCase().includes(lower)
      );
      setHits(filtered.slice(0, 8));
      setLoading(false);
    }, 180);
    return () => window.clearTimeout(t);
  }, [q, all, open]);

  const popular = useMemo(() => POPULAR, []);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 z-[60] flex justify-center pt-4 px-3 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 rounded-full bg-[var(--dk-surface)] px-4 py-3">
              <Search className="w-5 h-5 text-[var(--dk-muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSubmit(query.trim());
                  }
                }}
                placeholder="جستجو در همه کالاها"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--dk-muted)]"
                dir="rtl"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  className="p-1 rounded-full hover:bg-gray-200 text-[var(--dk-muted)]"
                  aria-label="پاک کردن"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 pb-5 max-h-[min(70vh,520px)] overflow-y-auto">
            {!q && (
              <>
                <h3 className="text-sm font-bold text-[#3f4064] mb-3 mt-2">جستجوهای پرطرفدار</h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {popular.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        onQueryChange(tag);
                        onSubmit(tag);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-[#3f4064] hover:border-[var(--dk-cta)] hover:text-[var(--dk-cta)] transition"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--dk-muted)]" />
                      {tag}
                    </button>
                  ))}
                </div>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="block rounded-2xl overflow-hidden bg-gradient-to-l from-[#3f4064] to-[var(--dk-cta)] text-white p-5"
                >
                  <div className="text-lg font-bold mb-1">گندم گالری</div>
                  <p className="text-sm text-white/85 mb-3">مشاهده همه کالاها و پیشنهادهای ویژه</p>
                  <span className="inline-block bg-white text-[var(--dk-cta)] text-sm font-bold px-4 py-2 rounded-full">
                    شروع خرید
                  </span>
                </Link>
              </>
            )}

            {q && (
              <>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <h3 className="text-sm font-bold text-[#3f4064]">نتایج برای «{q}»</h3>
                  {loading && <span className="text-xs text-[var(--dk-muted)]">...</span>}
                </div>
                {!loading && hits.length === 0 && (
                  <p className="text-sm text-[var(--dk-muted)] py-6 text-center">کالایی یافت نشد</p>
                )}
                <ul className="divide-y divide-gray-100">
                  {hits.map((p) => {
                    const href = `/product/${p.slug || p.documentId || p.id}`;
                    const img =
                      mediaUrl(Array.isArray(p.images) ? p.images[0] : p.images, 'thumbnail') ||
                      '/placeholders/product.svg';
                    const price = p.sale_price ?? p.price;
                    return (
                      <li key={String(p.documentId || p.id || p.slug)}>
                        <Link
                          to={href}
                          onClick={onClose}
                          className="flex items-center gap-3 py-3 hover:bg-[var(--dk-surface)] rounded-xl px-2 -mx-2 transition"
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover bg-[var(--dk-surface)] shrink-0"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholders/product.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-[#3f4064] line-clamp-2">{p.name}</div>
                            {price != null && (
                              <div className="text-sm font-bold text-[var(--dk-cta)] mt-1">
                                {formatPrice(Number(price))}
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {hits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onSubmit(q);
                      navigate(`/search?q=${encodeURIComponent(q)}`);
                      onClose();
                    }}
                    className="w-full mt-3 py-3 text-sm font-medium text-[var(--dk-cta)] hover:bg-[#fff0f2] rounded-xl transition"
                  >
                    مشاهده همه نتایج
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
