import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getProducts } from '../lib/catalog';
import { SectionRenderer } from '../components/dk/SectionRenderer';
import type { HomeSection } from '../components/dk/types';
import type { ProductCardData } from '../components/ProductCard';

type Props = { onAdd: (product: ProductCardData) => void };

function normalizeList(res: unknown): ProductCardData[] {
  if (Array.isArray(res)) return res as ProductCardData[];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r?.data)) return r.data as ProductCardData[];
  if (Array.isArray(r?.products)) return r.products as ProductCardData[];
  const data = r?.data as Record<string, unknown> | undefined;
  if (Array.isArray(data?.data)) return data.data as ProductCardData[];
  return [];
}

const PRODUCT_SECTION_TYPES = new Set([
  'incredible_offers',
  'product_slider',
  'product_row',
]);

function needsProductFallback(sections: HomeSection[]): boolean {
  if (!sections.length) return true;
  return sections.some(
    (s) => PRODUCT_SECTION_TYPES.has(String(s.type)) && !s.products?.length
  );
}

export function HomePage({ onAdd }: Props) {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallbackProducts, setFallbackProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const homeRes = await api.homepage();
        if (cancelled) return;
        const val = homeRes as Record<string, unknown>;
        const data = val?.data as Record<string, unknown> | undefined;
        const secs = (data?.sections || val?.sections || []) as HomeSection[];
        const list = Array.isArray(secs) ? secs : [];
        setSections(list);

        if (needsProductFallback(list)) {
          const prodRes = await getProducts().catch(() => null);
          if (!cancelled && prodRes) setFallbackProducts(normalizeList(prodRes));
        }
      } catch {
        if (!cancelled) setSections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-[#fafafa] pb-8">
      {loading && (
        <div className="dk-container py-16 text-center text-[var(--dk-muted)] text-sm">
          در حال بارگذاری...
        </div>
      )}
      {!loading && (
        <SectionRenderer sections={sections} fallbackProducts={fallbackProducts} onAdd={onAdd} />
      )}
    </div>
  );
}
