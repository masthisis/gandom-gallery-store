import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, Star, ShieldCheck, Heart, Share2 } from 'lucide-react';
import { api, getToken } from '../lib/api';
import { getCategoryTree, getProductMetas, getProducts } from '../lib/catalog';
import { formatPrice, mediaUrl, toFarsiDigits } from '../lib/format';
import { Breadcrumbs, type Crumb } from '../components/Breadcrumbs';
import { SimilarProducts } from '../components/SimilarProducts';
import type { ProductCardData } from '../components/ProductCard';
import {
  mergeProductMeta,
  metasFromResponse,
  parseGalleryUrls,
  type SpecItem,
} from '../lib/productMeta';

type Tab = 'description' | 'specs' | 'reviews' | 'qa';

type NavNode = {
  name: string;
  slug: string;
  commerceSlug?: string;
  children?: NavNode[];
};

function normalizeList(res: unknown): ProductCardData[] {
  if (Array.isArray(res)) return res as ProductCardData[];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r?.data)) return r.data as ProductCardData[];
  return [];
}

function collectImages(product: Record<string, unknown>): string[] {
  const fromMedia = (
    Array.isArray(product.images) ? product.images : product.images ? [product.images] : []
  )
    .map((img) => mediaUrl(img, 'large'))
    .filter(Boolean) as string[];
  const fromUrls = parseGalleryUrls(product.gallery_urls);
  const merged = [...fromMedia, ...fromUrls];
  return merged.length ? merged : ['/placeholders/product.svg'];
}

/** Deepest path in nav tree that matches any of the product category slugs */
function findCategoryPath(tree: NavNode[], catSlugs: Set<string>): NavNode[] {
  let best: NavNode[] = [];

  function walk(nodes: NavNode[], path: NavNode[]) {
    for (const n of nodes) {
      const next = [...path, n];
      const keys = [n.commerceSlug, n.slug].filter(Boolean) as string[];
      if (keys.some((k) => catSlugs.has(k)) && next.length > best.length) {
        best = next;
      }
      if (n.children?.length) walk(n.children, next);
    }
  }
  walk(tree, []);
  return best;
}

export function ProductPage({
  onAdd,
  onNeedAuth,
}: {
  onAdd: (p: ProductCardData) => void;
  onNeedAuth?: () => void;
}) {
  const { slug } = useParams();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [categoryTree, setCategoryTree] = useState<NavNode[]>([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('description');
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    setActiveImg(0);
    setTab('description');
    setReviewMsg('');
    setReplyTo(null);
    setProduct(null);
    setError('');
    let cancelled = false;
    (async () => {
      try {
        const [oneRes, metaRes, treeRes] = await Promise.all([
          api.wc.product(slug!),
          getProductMetas().catch(() => ({ data: [] })),
          getCategoryTree().catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;

        setCategoryTree((treeRes as { data?: NavNode[] })?.data || []);
        const metaMap = metasFromResponse(metaRes);
        const r = oneRes as Record<string, unknown>;
        const raw = (r?.data || r?.product || oneRes) as Record<string, unknown>;
        if (!raw || (!(raw as { name?: string }).name && !(raw as { slug?: string }).slug)) {
          setError('محصول یافت نشد');
          return;
        }
        const found = mergeProductMeta(raw, metaMap[String(raw.slug || slug)]) as unknown as ProductCardData;
        setProduct(found as unknown as Record<string, unknown>);

        // Load catalog in background for similar products (shared cache)
        getProducts()
          .then((prodRes) => {
            if (cancelled) return;
            const list = normalizeList(prodRes);
            const enriched = list.map((p) =>
              mergeProductMeta(p as Record<string, unknown>, metaMap[String(p.slug || '')])
            ) as ProductCardData[];
            setAllProducts(enriched);
          })
          .catch(() => {
            if (!cancelled) setAllProducts([]);
          });
      } catch {
        if (!cancelled) setError('خطا در دریافت محصول');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    api
      .productComments(slug)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setReviews(list);
      })
      .catch(() => setReviews([]));

    if (getToken()) {
      api
        .favoriteStatus(slug)
        .then((res) => setFavorited(!!res?.data?.favorited))
        .catch(() => setFavorited(false));
    } else {
      setFavorited(false);
    }
  }, [slug]);

  const similar = useMemo(() => {
    if (!product) return [];
    const cats = (product.product_categories || product.categories || []) as {
      slug?: string;
    }[];
    const catSlugs = new Set(cats.map((c) => c.slug).filter(Boolean) as string[]);
    const currentId = product.documentId || product.id || product.slug;
    return allProducts
      .filter((p) => {
        const id = p.documentId || p.id || p.slug;
        if (id === currentId) return false;
        const pc = ((p as any).product_categories || (p as any).categories || []) as {
          slug?: string;
        }[];
        return pc.some((c) => catSlugs.has(c.slug || ''));
      })
      .slice(0, 10);
  }, [product, allProducts]);

  const categoryPath = useMemo(() => {
    if (!product) return [] as NavNode[];
    const cats = (product.product_categories || product.categories || []) as {
      name?: string;
      slug?: string;
    }[];
    const catSlugs = new Set(cats.map((c) => c.slug).filter(Boolean) as string[]);
    const path = findCategoryPath(categoryTree, catSlugs);
    if (path.length) return path;
    return cats
      .filter((c) => c.slug)
      .map((c) => ({ name: c.name || c.slug || '', slug: c.slug || '' }));
  }, [product, categoryTree]);

  if (error) return <div className="dk-container py-16 text-center">{error}</div>;
  if (!product)
    return <div className="dk-container py-16 text-center text-[var(--dk-muted)]">در حال بارگذاری...</div>;

  const imgUrls = collectImages(product);
  const mainImg = imgUrls[activeImg] || imgUrls[0];
  const price = Number(product.price) || 0;
  const salePrice = product.sale_price != null ? Number(product.sale_price) : null;
  const hasSale = salePrice != null && salePrice < price;
  const displayPrice = hasSale ? salePrice! : price;
  const stock = product.stock_quantity as number | undefined;
  const outOfStock = product.stock_status === 'out_of_stock' || stock === 0;
  const specs = (product.specifications as SpecItem[]) || [];

  const desc =
    typeof product.description === 'string'
      ? product.description.replace(/<[^>]+>/g, '')
      : '';

  const topLevelReviews = reviews.filter((r) => !r.parentId);
  const avgRating =
    topLevelReviews.length > 0
      ? topLevelReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / topLevelReviews.length
      : 0;

  const pageCrumbs: Crumb[] = [
    ...categoryPath.map((c) => ({
      label: c.name,
      to: `/category/${(c as NavNode).commerceSlug || c.slug}`,
    })),
    { label: String(product.name) },
  ];

  const categoryCrumbs: Crumb[] = categoryPath.map((c) => ({
    label: c.name,
    to: `/category/${(c as NavNode).commerceSlug || c.slug}`,
  }));

  function handleAdd() {
    for (let i = 0; i < qty; i++) onAdd(product as unknown as ProductCardData);
  }

  async function toggleFavorite() {
    if (!getToken()) {
      onNeedAuth?.();
      return;
    }
    setFavBusy(true);
    try {
      const res = await api.toggleFavorite(String(product!.slug || slug));
      setFavorited(!!res?.data?.favorited);
    } catch {
      /* ignore */
    } finally {
      setFavBusy(false);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewMsg('');
    if (!getToken()) {
      setReviewMsg('برای ثبت دیدگاه ابتدا وارد شوید');
      return;
    }
    if (!reviewText.trim()) {
      setReviewMsg('متن دیدگاه را وارد کنید');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createProductComment({
        product: String(product!.slug || slug),
        rating: replyTo ? undefined : rating,
        review: reviewText.trim(),
        parentId: replyTo || undefined,
      });
      setReviewText('');
      setReplyTo(null);
      setReviewMsg(res?.message || 'دیدگاه شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود');
    } catch (err: any) {
      setReviewMsg(err.message || 'خطا در ثبت دیدگاه');
    } finally {
      setSubmitting(false);
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'description', label: 'معرفی' },
    { key: 'specs', label: 'مشخصات' },
    { key: 'reviews', label: `دیدگاه‌ها (${toFarsiDigits(topLevelReviews.length)})` },
    { key: 'qa', label: 'پرسش‌ها' },
  ];

  return (
    <div className="dk-container py-6">
      <Breadcrumbs items={pageCrumbs} />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-24 relative">
            <div className="absolute top-6 start-6 z-10 flex flex-col gap-2">
              <button
                type="button"
                disabled={favBusy}
                onClick={toggleFavorite}
                className={`w-10 h-10 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center ${
                  favorited ? 'text-[var(--dk-cta)]' : 'text-[var(--dk-muted)]'
                }`}
                aria-label="علاقه‌مندی"
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-[var(--dk-muted)]"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                }}
                aria-label="اشتراک‌گذاری"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-square bg-[var(--dk-surface)] rounded-xl overflow-hidden mb-3">
              <img
                src={mainImg}
                alt={String(product.name)}
                className="w-full h-full object-contain p-4"
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholders/product.svg';
                }}
              />
            </div>
            {imgUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imgUrls.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                      i === activeImg ? 'border-[var(--dk-cta)]' : 'border-transparent'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          {categoryCrumbs.length > 0 && (
            <nav aria-label="دسته‌بندی محصول" className="text-xs text-[var(--dk-cta)]">
              <ol className="flex flex-wrap items-center gap-1">
                {categoryCrumbs.map((c, i) => (
                  <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-[var(--dk-muted)]">/</span>}
                    {c.to ? (
                      <Link to={c.to} className="hover:underline">
                        {c.label}
                      </Link>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <h1 className="text-xl md:text-2xl font-bold text-[#3f4064] leading-8">
            {String(product.name)}
          </h1>

          <div className="flex items-center gap-2 text-sm text-[var(--dk-muted)]">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(avgRating || 4) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span>
              {avgRating ? toFarsiDigits(avgRating.toFixed(1)) : '—'} از ۵ ·{' '}
              {toFarsiDigits(topLevelReviews.length)} دیدگاه
            </span>
          </div>

          {specs.length > 0 && (
            <div className="bg-[var(--dk-surface)] rounded-xl p-4">
              <div className="text-sm font-bold text-[#3f4064] mb-3">ویژگی‌ها</div>
              <div className="grid grid-cols-2 gap-3">
                {specs.slice(0, 4).map((s) => (
                  <div key={s.label} className="bg-white rounded-lg p-3">
                    <div className="text-[11px] text-[var(--dk-muted)] mb-1">{s.label}</div>
                    <div className="text-sm font-medium text-[#3f4064]">{s.value}</div>
                  </div>
                ))}
              </div>
              {specs.length > 4 && (
                <button
                  type="button"
                  onClick={() => setTab('specs')}
                  className="mt-3 w-full text-sm text-[var(--dk-cta)] font-medium py-2 hover:bg-white rounded-lg"
                >
                  مشاهده همه مشخصات
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-[#39ae00]">
            <ShieldCheck className="w-4 h-4" />
            <span>گارانتی اصالت و سلامت فیزیکی کالا</span>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24 space-y-4">
            {hasSale && (
              <div className="text-sm text-[var(--dk-muted)] line-through">{formatPrice(price)}</div>
            )}
            <div className="text-xl font-bold text-[#3f4064]">{formatPrice(displayPrice)}</div>
            {!outOfStock && typeof stock === 'number' && stock <= 5 && (
              <p className="text-sm text-[var(--dk-cta)] font-medium">
                تنها {toFarsiDigits(stock)} عدد در انبار باقی مانده
              </p>
            )}
            <div className="flex items-center justify-between border rounded-lg p-2">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-[var(--dk-surface)] disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-medium">{toFarsiDigits(qty)}</span>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-[var(--dk-surface)]"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className="w-full bg-[var(--dk-cta)] text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {outOfStock ? 'ناموجود' : 'افزودن به سبد خرید'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.key
                  ? 'border-[var(--dk-cta)] text-[var(--dk-cta)]'
                  : 'border-transparent text-[var(--dk-muted)] hover:text-[#3f4064]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'description' && (
            <div className="text-sm leading-8 text-[#3f4064] whitespace-pre-wrap">
              {desc || 'توضیحاتی برای این محصول ثبت نشده است.'}
            </div>
          )}
          {tab === 'specs' && (
            <div className="max-w-2xl">
              {specs.length === 0 ? (
                <p className="text-sm text-[var(--dk-muted)]">مشخصاتی ثبت نشده است.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((s) => (
                      <tr key={s.label} className="border-b border-gray-100">
                        <td className="py-3 pe-4 text-[var(--dk-muted)] w-1/3">{s.label}</td>
                        <td className="py-3 font-medium text-[#3f4064]">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {tab === 'reviews' && (
            <div className="space-y-6 max-w-2xl">
              <form onSubmit={submitReview} className="bg-[var(--dk-surface)] rounded-xl p-4 space-y-3">
                <div className="text-sm font-bold text-[#3f4064]">
                  {replyTo ? 'پاسخ به دیدگاه' : 'ثبت دیدگاه'}
                </div>
                {!getToken() && (
                  <p className="text-xs text-[var(--dk-muted)]">
                    برای ثبت دیدگاه{' '}
                    <button type="button" className="text-[var(--dk-cta)]" onClick={() => onNeedAuth?.()}>
                      وارد شوید
                    </button>
                  </p>
                )}
                {!replyTo && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="p-0.5"
                        aria-label={`${n} ستاره`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {replyTo && (
                  <button
                    type="button"
                    className="text-xs text-[var(--dk-muted)]"
                    onClick={() => setReplyTo(null)}
                  >
                    انصراف از پاسخ
                  </button>
                )}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  placeholder={replyTo ? 'پاسخ خود را بنویسید...' : 'نظر خود را بنویسید...'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--dk-cta)] bg-white"
                />
                {reviewMsg && <p className="text-xs text-[var(--dk-cta)]">{reviewMsg}</p>}
                <button
                  type="submit"
                  disabled={submitting || !getToken()}
                  className="bg-[var(--dk-cta)] text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-50"
                >
                  {submitting ? '...' : replyTo ? 'ارسال پاسخ' : 'ارسال دیدگاه'}
                </button>
              </form>

              {topLevelReviews.length === 0 ? (
                <p className="text-center text-[var(--dk-muted)] py-6 text-sm">
                  هنوز دیدگاهی ثبت نشده است.
                </p>
              ) : (
                topLevelReviews.map((r, i) => {
                  const user = r.user as Record<string, unknown> | null;
                  const replies = (Array.isArray(r.replies) ? r.replies : []) as Record<
                    string,
                    unknown
                  >[];
                  return (
                    <div key={String(r.id || i)} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {String(user?.display_name || 'خریدار')}
                        </span>
                        <div className="flex text-amber-400 ms-auto">
                          {Array.from({ length: Number(r.rating) || 0 }).map((_, j) => (
                            <Star key={j} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#3f4064] leading-7">
                        {String(r.review || r.body || '')}
                      </p>
                      {!r.legacy && (
                        <button
                          type="button"
                          className="text-xs text-[var(--dk-cta)] mt-2"
                          onClick={() => {
                            setReplyTo(r.id as number | string);
                            setTab('reviews');
                          }}
                        >
                          پاسخ
                        </button>
                      )}
                      {replies.length > 0 && (
                        <div className="mt-3 ms-4 border-s-2 border-gray-100 ps-4 space-y-3">
                          {replies.map((rep) => {
                            const ru = rep.user as Record<string, unknown> | null;
                            return (
                              <div key={String(rep.id)}>
                                <div className="font-medium text-xs text-[var(--dk-muted)] mb-1">
                                  {String(ru?.display_name || 'کاربر')}
                                </div>
                                <p className="text-sm text-[#3f4064] leading-7">
                                  {String(rep.review || rep.body || '')}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
          {tab === 'qa' && (
            <p className="text-center text-[var(--dk-muted)] py-8 text-sm">
              پرسشی ثبت نشده است.
            </p>
          )}
        </div>
      </div>

      <SimilarProducts products={similar} onAdd={onAdd} />
    </div>
  );
}
