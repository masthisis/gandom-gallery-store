import { api } from './api';

const TTL_MS = 60_000;

type CacheEntry<T> = { at: number; promise: Promise<T> };

const cache: {
  products?: CacheEntry<unknown>;
  categoryTree?: CacheEntry<unknown>;
  productMetas?: CacheEntry<unknown>;
} = {};

function getCached<T>(
  key: keyof typeof cache,
  loader: () => Promise<T>,
  force = false
): Promise<T> {
  const hit = cache[key] as CacheEntry<T> | undefined;
  if (!force && hit && Date.now() - hit.at < TTL_MS) return hit.promise;
  const promise = loader().catch((err) => {
    if (cache[key]?.promise === promise) delete cache[key];
    throw err;
  });
  cache[key] = { at: Date.now(), promise };
  return promise;
}

/** Shared catalog fetches — dedupes MegaMenu / Shop / Search / PDP. */
export function getProducts(force = false) {
  return getCached('products', () => api.wc.products(), force);
}

export function getCategoryTree(force = false) {
  return getCached('categoryTree', () => api.categoryTree(), force);
}

export function getProductMetas(force = false) {
  return getCached('productMetas', () => api.productMetas(), force);
}
