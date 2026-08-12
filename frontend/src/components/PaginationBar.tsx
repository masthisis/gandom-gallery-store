import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toFarsiDigits } from '../lib/format';

type Props = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  animating?: boolean;
};

function pageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function PaginationBar({ page, pageCount, onPageChange, animating = false }: Props) {
  if (pageCount <= 1) return null;

  const nums = pageNumbers(page, pageCount);

  return (
    <nav
      className={`flex items-center justify-center gap-1 flex-wrap transition-opacity duration-300 ${
        animating ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="صفحه‌بندی"
      aria-busy={animating}
    >
      {animating && (
        <Loader2 className="w-4 h-4 text-[var(--dk-muted)] animate-spin absolute opacity-0" aria-hidden />
      )}
      <button
        type="button"
        disabled={page <= 1 || animating}
        onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-[var(--dk-surface)] transition-transform active:scale-95"
        aria-label="صفحه قبل"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {nums.map((n, i) =>
        n === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-[var(--dk-muted)]">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            disabled={animating}
            onClick={() => onPageChange(n)}
            className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm transition-all duration-200 active:scale-95 ${
              n === page
                ? 'bg-[#3f4064] text-white shadow-sm scale-105'
                : 'border border-gray-200 text-[#3f4064] hover:bg-[var(--dk-surface)]'
            }`}
          >
            {toFarsiDigits(n)}
          </button>
        )
      )}
      <button
        type="button"
        disabled={page >= pageCount || animating}
        onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-[var(--dk-surface)] transition-transform active:scale-95"
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </nav>
  );
}
