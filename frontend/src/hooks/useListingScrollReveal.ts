import { useEffect, useRef, type RefObject } from 'react';

type Options = {
  loadingMore: boolean;
  page: number;
  visibleCount: number;
  pageSize: number;
  usePagination: boolean;
  listingRef: RefObject<HTMLElement | null>;
  newBatchAnchorRef: RefObject<HTMLElement | null>;
  /** Skip scroll when filters reset listing to page 1. */
  resetKey?: string;
};

function scrollSmooth(el: HTMLElement, block: ScrollLogicalPosition) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block,
  });
}

/**
 * After infinite scroll append: scroll so the first new item sits toward the bottom
 * of the viewport — user continues scrolling down into fresh results.
 * After pagination page change: scroll listing block to top.
 */
export function useListingScrollReveal({
  loadingMore,
  page,
  visibleCount,
  pageSize,
  usePagination,
  listingRef,
  newBatchAnchorRef,
  resetKey = '',
}: Options) {
  const prevPage = useRef(page);
  const prevCount = useRef(visibleCount);
  const prevResetKey = useRef(resetKey);

  useEffect(() => {
    if (loadingMore) return;

    const resetChanged = prevResetKey.current !== resetKey;
    if (resetChanged) {
      prevResetKey.current = resetKey;
      prevPage.current = page;
      prevCount.current = visibleCount;
      return;
    }

    const pageChanged = usePagination && prevPage.current !== page;
    const countIncreased = !usePagination && visibleCount > prevCount.current;

    if (pageChanged || countIncreased) {
      window.requestAnimationFrame(() => {
        if (usePagination && pageChanged && listingRef.current) {
          scrollSmooth(listingRef.current, 'start');
        } else if (countIncreased && newBatchAnchorRef.current) {
          scrollSmooth(newBatchAnchorRef.current, 'end');
        }
      });
    }

    prevPage.current = page;
    prevCount.current = visibleCount;
  }, [
    loadingMore,
    page,
    visibleCount,
    pageSize,
    usePagination,
    listingRef,
    newBatchAnchorRef,
    resetKey,
  ]);
}
