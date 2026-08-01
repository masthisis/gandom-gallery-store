import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { getCategoryTree, getProductMetas, getProducts } from '../lib/catalog';
import { ProductCard, type ProductCardData } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { toFarsiDigits } from '../lib/format';
import type { CategoryItem } from '../components/dk/types';
import { mergeProductMeta, metasFromResponse, type SpecItem } from '../lib/productMeta';

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

function flattenCategories(tree: CategoryItem[]): CategoryItem[] {
  const out: CategoryItem[] = [];
  for (const c of tree) {
    out.push(c);
    if (c.children?.length) out.push(...flattenCategories(c.children));
  }
  return out;
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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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
        setCategories(flattenCategories(data));
      })
      .catch(() => setCategories([]));
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
      list = list.filter((p) => {
        const cats =
          (p as Record<string, unknown>).product_categories ||
          (p as Record<string, unknown>).categories ||
          [];
        return (cats as { slug?: string; name?: string }[]).some(
          (c) => c.slug === slug || c.name === slug
        );
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
  }, [products, slug, q, sort, minPrice, maxPrice, inStockOnly, specFilter]);

  const catName = categories.find((c) => c.slug === slug)?.name;
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
        <h3 className="font-bold text-sm text-[#3f4064] mb-3">دسته‌بندی</h3>
        <ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
          <li>
            <Link
              to="/shop"
              className={`block py-1.5 px-2 rounded-lg hover:bg-[var(--dk-surface)] ${!slug ? 'text-[var(--dk-cta)] font-medium bg-[#fff0f2]' : 'text-[#3f4064]'}`}
            >
              همه محصولات
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/category/${c.slug}`}
                className={`block py-1.5 px-2 rounded-lg hover:bg-[var(--dk-surface)] ${slug === c.slug ? 'text-[var(--dk-cta)] font-medium bg-[#fff0f2]' : 'text-[#3f4064]'}`}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

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
    <div className="dk-container py-6">
      <Breadcrumbs
        items={[
          { label: 'فروشگاه', to: '/shop' },
          ...(catName ? [{ label: catName }] : q ? [{ label: `جستجو: ${q}` }] : [{ label: 'همه کالاها' }]),
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-bold text-[#3f4064]">{title}</h1>
        <button
          type="button"
          className="md:hidden flex items-center gap-1 text-sm border rounded-lg px-3 py-2"
          onClick={() => setFilterOpen((v) => !v)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          فیلتر
          <ChevronDown className={`w-4 h-4 transition ${filterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex gap-6">
        <div className={`w-full md:w-56 shrink-0 ${filterOpen ? 'block' : 'hidden md:block'}`}>
          {sidebar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {SORT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSort(tab.key)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm transition ${
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
            <p className="text-[var(--dk-muted)] text-sm">در حال بارگذاری...</p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id || p.slug} product={p} onAdd={() => onAdd(p)} />
              ))}
            </div>
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
