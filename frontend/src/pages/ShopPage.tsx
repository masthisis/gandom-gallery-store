import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { getCategoryTree, getProductMetas, getProducts } from '../lib/catalog';
import { ProductCard, type ProductCardData } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryFilterTree } from '../components/CategoryFilterTree';
import { ListingPaginationFooter } from '../components/ListingPaginationFooter';
import {
  ProductCardSkeleton,
  ProductGridSkeleton,
} from '../components/skeletons/ListingSkeletons';
import { toFarsiDigits } from '../lib/format';
import { findCategoryNode, getFilterSlugsForCategory } from '../lib/categoryTree';
import type { CategoryItem } from '../components/dk/types';
import { mergeProductMeta, metasFromResponse, type SpecItem } from '../lib/productMeta';
import { usePaginatedSlice } from '../hooks/usePaginatedSlice';
import { useListingScrollReveal } from '../hooks/useListingScrollReveal';

const SHOP_PAGE_SIZE = 24;

type SortKey = 'newest' | 'cheapest' | 'expensive' | 'sale';

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'جدیدترین' },
  { key: 'cheapest', label: 'ارزان‌ترین' },
  { key: 'expensive', label: 'گران‌ترین' },
  { key: 'sale', label: 'بیشترین تخفیف' },
];

function normalizeList(res: unknown): ProductCardData[] {
  if (Array.isArray(res)) return res as ProductCardData[];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r?.data)) return r.data as ProductCardData[];
  if (Array.isArray(r?.products)) return r.products as ProductCardData[];
  return [];
}

function effectivePrice(p: ProductCardData): number {
  return Number(p.sale_price ?? p.price) || 0;
}

function discountPct(p: ProductCardData): number {
  const price = Number(p.price) || 0;
  const sale = p.sale_price != null ? Number(p.sale_price) : null;
  if (!sale || sale >= price) return 0;
  return ((price - sale) / price) * 100;
}

function getSpecs(p: ProductCardData): SpecItem[] {
  return ((p as Record<string, unknown>).specifications as SpecItem[]) || [];
}

export function ShopPage({ onAdd }: { onAdd: (p: ProductCardData) => void }) {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const sort = (params.get('sort') as SortKey) || 'newest';
  const specFilter = params.get('spec') || ''; // format: Label:Value

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    getCategoryTree()
      .then((res) => {
        const data = Array.isArray((res as { data?: unknown })?.data)
          ? (res as { data: CategoryItem[] }).data
          : Array.isArray(res)
            ? (res as CategoryItem[])
            : [];
        setCategoryTree(data);
      })
      .catch(() => setCategoryTree([]));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prodRes, metaRes] = await Promise.all([
          getProducts(),
          getProductMetas().catch(() => ({ data: [] })),
        ]);
        const metaMap = metasFromResponse(metaRes);
        const list = normalizeList(prodRes).map((p) =>
          mergeProductMeta(p as Record<string, unknown>, metaMap[String(p.slug || '')])
        ) as ProductCardData[];
        setProducts(list);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const specOptions = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of products) {
      for (const s of getSpecs(p)) {
        if (!map.has(s.label)) map.set(s.label, new Set());
        map.get(s.label)!.add(s.value);
      }
    }
    return Array.from(map.entries()).map(([label, values]) => ({
      label,
      values: Array.from(values).sort(),
    }));
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (slug) {
      const allowed = getFilterSlugsForCategory(categoryTree, slug);
      list = list.filter((p) => {
        const cats =
          (p as Record<string, unknown>).product_categories ||
          (p as Record<string, unknown>).categories ||
          [];
        return (cats as { slug?: string }[]).some((c) => c.slug && allowed.has(c.slug));
      });
    }

    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (p) =>
          String(p.name || '').toLowerCase().includes(qq) ||
          getSpecs(p).some(
            (s) =>
              s.label.toLowerCase().includes(qq) || s.value.toLowerCase().includes(qq)
          )
      );
    }

    if (specFilter) {
      const [label, ...rest] = specFilter.split(':');
      const value = rest.join(':');
      if (label && value) {
        list = list.filter((p) =>
          getSpecs(p).some((s) => s.label === label && s.value === value)
        );
      }
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) list = list.filter((p) => effectivePrice(p) >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) list = list.filter((p) => effectivePrice(p) <= max);
    }

    if (inStockOnly) {
      list = list.filter((p) => {
        const stock = (p as Record<string, unknown>).stock_quantity;
        const status = (p as Record<string, unknown>).stock_status;
        if (status === 'out_of_stock') return false;
        if (typeof stock === 'number') return stock > 0;
        return true;
      });
    }

    switch (sort) {
      case 'cheapest':
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'expensive':
        list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case 'sale':
        list.sort((a, b) => discountPct(b) - discountPct(a));
        break;
      default:
        list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }

    return list;
  }, [products, slug, q, sort, minPrice, maxPrice, inStockOnly, specFilter, categoryTree]);

  const filterResetKey = `${slug}|${q}|${sort}|${specFilter}|${minPrice}|${maxPrice}|${inStockOnly}`;

  const {
    visibleItems,
    hasMore,
    loadMore,
    loadingMore,
    page,
    pageCount,
    setPage,
    total,
    usePagination,
    paginationForced,
  } = usePaginatedSlice(filtered, {
    pageSize: SHOP_PAGE_SIZE,
    mode: 'hybrid',
    maxAutoLoads: 4,
    resetKey: filterResetKey,
  });

  const listingRef = useRef<HTMLDivElement>(null);
  const newBatchAnchorRef = useRef<HTMLDivElement>(null);
  const newBatchStartIndex =
    !usePagination && page > 1 ? (page - 1) * SHOP_PAGE_SIZE : -1;

  useListingScrollReveal({
    loadingMore,
    page,
    visibleCount: visibleItems.length,
    pageSize: SHOP_PAGE_SIZE,
    usePagination,
    listingRef,
    newBatchAnchorRef,
    resetKey: filterResetKey,
  });

  const catName = slug ? findCategoryNode(categoryTree, slug)?.name : undefined;
  const title = q
    ? `نتایج جستجو برای «${q}»`
    : catName
      ? catName
      : 'همه محصولات';

  function setSort(key: SortKey) {
    const next = new URLSearchParams(params);
    next.set('sort', key);
    setParams(next);
  }

  function toggleSpec(label: string, value: string) {
    const next = new URLSearchParams(params);
    const token = `${label}:${value}`;
    if (specFilter === token) next.delete('spec');
    else next.set('spec', token);
    setParams(next);
  }

  const sidebar = (
    <aside className="bg-white rounded-2xl p-4 shadow-sm space-y-5">
      <div>
        <h3 className="font-bold text-sm text-[#3f4064] mb-3">محدوده قیمت</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="از"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[var(--dk-cta)]"
          />
          <input
            type="number"
            placeholder="تا"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[var(--dk-cta)]"
          />
        </div>
      </div>

      <CategoryFilterTree tree={categoryTree} activeSlug={slug} />

      {specOptions.slice(0, 6).map((group) => (
        <div key={group.label}>
          <h3 className="font-bold text-sm text-[#3f4064] mb-2">{group.label}</h3>
          <ul className="space-y-1 text-sm max-h-36 overflow-y-auto">
            {group.values.map((v) => {
              const active = specFilter === `${group.label}:${v}`;
              return (
                <li key={v}>
                  <button
                    type="button"
                    onClick={() => toggleSpec(group.label, v)}
                    className={`w-full text-start py-1.5 px-2 rounded-lg hover:bg-[var(--dk-surface)] ${
                      active ? 'bg-[#fff0f2] text-[var(--dk-cta)] font-medium' : 'text-[#3f4064]'
                    }`}
                  >
                    {v}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <label className="flex items-center gap-2 text-sm text-[#3f4064] cursor-pointer">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="accent-[var(--dk-cta)]"
        />
        فقط کالاهای موجود
      </label>
    </aside>
  );

  return (
    <div className="dk-container py-4 sm:py-6">
      <Breadcrumbs
        items={[
          { label: 'فروشگاه', to: '/shop' },
          ...(catName ? [{ label: catName }] : q ? [{ label: `جستجو: ${q}` }] : [{ label: 'همه کالاها' }]),
        ]}
      />

      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#3f4064] min-w-0 truncate">
          {title}
        </h1>
        <button
          type="button"
          className="md:hidden flex items-center gap-1.5 text-sm border border-gray-200 bg-white rounded-xl px-3 py-2.5 shrink-0"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          فیلتر
        </button>
      </div>

      {/* Mobile filter bottom sheet */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="بستن فیلتر"
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl shadow-2xl p-4 pb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#3f4064]">فیلترها</h2>
              <button
                type="button"
                className="text-sm text-[var(--dk-cta)] font-medium px-2 py-1"
                onClick={() => setFilterOpen(false)}
              >
                بستن
              </button>
            </div>
            {sidebar}
            <button
              type="button"
              className="mt-4 w-full bg-[var(--dk-cta)] text-white py-3 rounded-xl font-medium"
              onClick={() => setFilterOpen(false)}
            >
              مشاهده نتایج
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="hidden md:block w-56 shrink-0">{sidebar}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide -mx-1 px-1">
            {SORT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSort(tab.key)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-sm transition ${
                  sort === tab.key
                    ? 'bg-[#3f4064] text-white'
                    : 'bg-white text-[#3f4064] hover:bg-[var(--dk-surface)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-[var(--dk-muted)] mb-4">
            {toFarsiDigits(filtered.length)} کالا
            {specFilter ? ` · فیلتر: ${specFilter.replace(':', ' = ')}` : ''}
          </p>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length > 0 ? (
            <>
              <div
                ref={listingRef}
                key={`shop-page-${page}-${usePagination ? 'p' : 'i'}`}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 animate-[fadeIn_0.35s_ease] scroll-mt-24"
              >
                {visibleItems.map((p, i) => (
                  <div
                    key={p.id || p.slug}
                    ref={i === newBatchStartIndex ? newBatchAnchorRef : undefined}
                  >
                    <ProductCard product={p} onAdd={() => onAdd(p)} />
                  </div>
                ))}
              </div>
              <ListingPaginationFooter
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
                usePagination={usePagination}
                paginationForced={paginationForced}
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                total={total}
                loadSkeleton={
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 pt-2">
                    <ProductCardSkeleton count={4} />
                  </div>
                }
              />
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-[var(--dk-muted)]">محصولی یافت نشد</p>
              <Link to="/shop" className="inline-block mt-4 text-[var(--dk-cta)] text-sm font-medium">
                مشاهده همه محصولات
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
