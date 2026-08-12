import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  label?: string;
};

export function InfiniteScrollSentinel({
  hasMore,
  loading = false,
  onLoadMore,
  label = 'در حال بارگذاری...',
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={sentinelRef} className="py-6 text-center animate-[fadeIn_0.3s_ease]">
      {loading ? (
        <div className="inline-flex items-center gap-2 text-sm text-[var(--dk-muted)]">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--dk-cta)]" />
          <span>{label}</span>
        </div>
      ) : typeof IntersectionObserver === 'undefined' ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="text-sm text-[var(--dk-cta)] font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-[var(--dk-surface)] transition active:scale-95"
        >
          نمایش بیشتر
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 text-xs text-[var(--dk-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--dk-cta)] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--dk-cta)] animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--dk-cta)] animate-pulse [animation-delay:300ms]" />
        </div>
      )}
    </div>
  );
}
