export type SpecItem = { label: string; value: string };

export function parseSpecs(raw: unknown): SpecItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      const o = s as Record<string, unknown>;
      const label = String(o.label || o.key || '').trim();
      const value = String(o.value || '').trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean) as SpecItem[];
}

export function parseGalleryUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((u) => String(u)).filter(Boolean);
}

export type ProductMetaMap = Record<
  string,
  { specifications: SpecItem[]; gallery_urls: string[] }
>;

export function metasFromResponse(res: unknown): ProductMetaMap {
  const list = Array.isArray((res as { data?: unknown })?.data)
    ? ((res as { data: any[] }).data as any[])
    : Array.isArray(res)
      ? (res as any[])
      : [];
  const map: ProductMetaMap = {};
  for (const row of list) {
    const attrs = row.attributes || row;
    const slug = attrs.productSlug || row.productSlug;
    if (!slug) continue;
    map[slug] = {
      specifications: parseSpecs(attrs.specifications ?? row.specifications),
      gallery_urls: parseGalleryUrls(attrs.gallery_urls ?? row.gallery_urls),
    };
  }
  return map;
}

export function mergeProductMeta<T extends Record<string, unknown>>(
  product: T,
  meta?: { specifications?: SpecItem[]; gallery_urls?: string[] } | null
): T & { specifications: SpecItem[]; gallery_urls: string[] } {
  const fromProduct = parseSpecs(product.specifications);
  const fromMeta = meta?.specifications || [];
  const galleryFromProduct = parseGalleryUrls(product.gallery_urls);
  const galleryFromMeta = meta?.gallery_urls || [];
  return {
    ...product,
    specifications: fromProduct.length ? fromProduct : fromMeta,
    gallery_urls: galleryFromProduct.length ? galleryFromProduct : galleryFromMeta,
  };
}
