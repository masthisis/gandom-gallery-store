import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--dk-muted)]">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-[var(--dk-cta)]">
            <Home className="w-3.5 h-3.5" />
            فروشگاه
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5 opacity-50" />
            {item.to && i < items.length - 1 ? (
              <Link to={item.to} className="hover:text-[var(--dk-cta)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#3f4064] font-medium line-clamp-1 max-w-[220px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
