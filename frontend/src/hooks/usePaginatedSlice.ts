import { useCallback, useEffect, useMemo, useState } from 'react';

export type PaginatedSliceMode = 'infinite' | 'pages' | 'hybrid';

export type PaginatedSliceOptions = {
  pageSize: number;
  mode?: PaginatedSliceMode;
  resetKey?: string;
  /** After this many scroll-triggered loads, switch to numbered pagination (hybrid mode). */
  maxAutoLoads?: number;
};

const DEFAULT_MAX_AUTO_LOADS = 4;
const LOAD_MIN_MS = 380;

export function usePaginatedSlice<T>(
  items: T[],
  {
    pageSize,
    mode = 'infinite',
    resetKey = '',
    maxAutoLoads = DEFAULT_MAX_AUTO_LOADS,
  }: PaginatedSliceOptions
) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoLoadCount, setAutoLoadCount] = useState(0);
  const [paginationForced, setPaginationForced] = useState(false);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);

  const usePagination =
    mode === 'pages' || (mode === 'hybrid' && (paginationForced || autoLoadCount >= maxAutoLoads));

  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
    setAutoLoadCount(0);
    setPaginationForced(false);
  }, [resetKey, pageSize]);

  const visibleItems = useMemo(() => {
    if (usePagination) {
      const start = (page - 1) * pageSize;
      return items.slice(start, start + pageSize);
    }
    return items.slice(0, Math.min(page * pageSize, total));
  }, [items, page, pageSize, usePagination, total]);

  const cappedCount = usePagination ? page * pageSize : Math.min(page * pageSize, total);
  const hasMore = !usePagination && cappedCount < total;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const started = Date.now();
    window.setTimeout(() => {
      setAutoLoadCount((c) => {
        const nextCount = c + 1;
        if (mode === 'hybrid' && nextCount >= maxAutoLoads) {
          setPaginationForced(true);
          setPage(1);
        } else {
          setPage((p) => p + 1);
        }
        return nextCount;
      });
      setLoadingMore(false);
    }, Math.max(0, LOAD_MIN_MS - (Date.now() - started)));
  }, [hasMore, loadingMore, mode, maxAutoLoads]);

  const goToPage = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(1, next), pageCount);
      setLoadingMore(true);
      window.setTimeout(() => {
        setPage(clamped);
        setLoadingMore(false);
      }, 220);
    },
    [pageCount]
  );

  return {
    visibleItems,
    hasMore,
    loadMore,
    loadingMore,
    page: usePagination ? page : Math.ceil(cappedCount / pageSize) || 1,
    setPage: goToPage,
    pageCount,
    total,
    usePagination,
    paginationForced: mode === 'hybrid' && paginationForced,
    autoLoadCount,
  };
}
