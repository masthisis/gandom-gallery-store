type Props = {
  count?: number;
  compact?: boolean;
};

export function ProductCardSkeleton({ count = 1, compact = false }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col h-full animate-[fadeIn_0.35s_ease]"
          aria-hidden
        >
          <div
            className={`relative aspect-square bg-[var(--dk-surface)] skeleton-shimmer ${compact ? 'p-2' : 'p-2 sm:p-3'}`}
          />
          <div className={`flex flex-col gap-2 flex-1 ${compact ? 'p-2' : 'p-2.5 sm:p-3'}`}>
            <div className="h-3.5 rounded-md skeleton-shimmer w-full" />
            <div className="h-3.5 rounded-md skeleton-shimmer w-[80%]" />
            <div className="mt-auto h-4 rounded-md skeleton-shimmer w-1/2" />
            {!compact && <div className="h-9 rounded-lg skeleton-shimmer w-full mt-1 hidden sm:block" />}
          </div>
        </article>
      ))}
    </>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
      <ProductCardSkeleton count={count} />
    </div>
  );
}

export function WishlistItemSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-100 rounded-xl p-4 flex justify-between gap-3 animate-[fadeIn_0.35s_ease]"
          aria-hidden
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded-md skeleton-shimmer w-3/4" />
            <div className="h-3 rounded-md skeleton-shimmer w-1/3" />
          </div>
          <div className="w-5 h-5 rounded-full skeleton-shimmer shrink-0" />
        </div>
      ))}
    </>
  );
}

export function ReviewSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 pb-4 space-y-2 animate-[fadeIn_0.35s_ease]" aria-hidden>
          <div className="flex gap-2">
            <div className="h-4 rounded-md skeleton-shimmer w-24" />
            <div className="h-3 rounded-md skeleton-shimmer w-16 ms-auto" />
          </div>
          <div className="h-3 rounded-md skeleton-shimmer w-full" />
          <div className="h-3 rounded-md skeleton-shimmer w-[83%]" />
        </div>
      ))}
    </>
  );
}

export function OrderRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-100 rounded-xl p-4 space-y-2 animate-[fadeIn_0.35s_ease]"
          aria-hidden
        >
          <div className="flex justify-between">
            <div className="h-4 rounded-md skeleton-shimmer w-32" />
            <div className="h-4 rounded-md skeleton-shimmer w-20" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 rounded-md skeleton-shimmer w-24" />
            <div className="h-3 rounded-md skeleton-shimmer w-16" />
          </div>
        </div>
      ))}
    </>
  );
}
