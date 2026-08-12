import type { ReactNode } from 'react';
import { InfiniteScrollSentinel } from './InfiniteScrollSentinel';
import { PaginationBar } from './PaginationBar';
import { toFarsiDigits } from '../lib/format';

type Props = {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  usePagination: boolean;
  paginationForced?: boolean;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total: number;
  loadSkeleton?: ReactNode;
};

export function ListingPaginationFooter({
  hasMore,
  loadingMore,
  onLoadMore,
  usePagination,
  paginationForced = false,
  page,
  pageCount,
  onPageChange,
  total,
  loadSkeleton,
}: Props) {
  const showPagination = usePagination && pageCount > 1;
  const showInfinite = !usePagination && hasMore;

  return (
    <div className="mt-2">
      {loadingMore && loadSkeleton ? (
        <div className="animate-[fadeIn_0.3s_ease]">{loadSkeleton}</div>
      ) : null}

      {paginationForced && showPagination && (
        <p className="text-center text-xs text-[var(--dk-muted)] mb-3 animate-[fadeIn_0.4s_ease]">
          برای ادامه، از صفحه‌بندی زیر استفاده کنید
        </p>
      )}

      {showInfinite && (
        <InfiniteScrollSentinel hasMore={hasMore} loading={loadingMore} onLoadMore={onLoadMore} />
      )}

      {showPagination && (
        <div
          className={`animate-[fadeIn_0.45s_ease] ${paginationForced ? 'pt-2 border-t border-gray-100' : ''}`}
        >
          <p className="text-center text-xs text-[var(--dk-muted)] mb-2">
            {toFarsiDigits(total)} مورد · صفحه {toFarsiDigits(page)} از {toFarsiDigits(pageCount)}
          </p>
          <PaginationBar page={page} pageCount={pageCount} onPageChange={onPageChange} animating={loadingMore} />
        </div>
      )}
    </div>
  );
}
