import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { getCategoryTree } from '../../lib/catalog';
import type { CategoryItem } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MegaMenu({ open, onClose }: Props) {
  const [tree, setTree] = useState<CategoryItem[]>([]);
  const [active, setActive] = useState<CategoryItem | null>(null);

  useEffect(() => {
    if (!open) return;
    getCategoryTree()
      .then((res) => {
        const data = Array.isArray((res as { data?: unknown })?.data)
          ? (res as { data: CategoryItem[] }).data
          : Array.isArray(res)
            ? (res as CategoryItem[])
            : [];
        setTree(data);
        if (data.length) setActive(data[0]);
      })
      .catch(() => setTree([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const children = active?.children || [];

  return (
    <>
      <div className="fixed inset-0 z-[45] bg-black/25" style={{ top: 'var(--header-h, 72px)' }} onClick={onClose} />
      <div
        className="absolute left-0 right-0 z-[50] bg-white border-t border-gray-100 shadow-xl"
        style={{ top: '100%' }}
      >
        <div className="dk-container">
          <div className="flex items-center justify-between py-3 md:hidden border-b border-gray-100">
            <span className="font-bold text-[#3f4064]">دسته‌بندی کالاها</span>
            <button type="button" onClick={onClose} aria-label="بستن">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex min-h-[280px] max-h-[min(420px,70vh)] overflow-hidden">
            <nav className="w-52 sm:w-60 shrink-0 border-e border-gray-100 overflow-y-auto py-2 bg-[#fafafa]">
              {tree.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onMouseEnter={() => setActive(cat)}
                  onFocus={() => setActive(cat)}
                  onClick={() => setActive(cat)}
                  className={`w-full text-start px-4 py-3 text-sm flex items-center justify-between transition ${
                    active?.slug === cat.slug
                      ? 'bg-white text-[var(--dk-cta)] font-medium border-e-2 border-[var(--dk-cta)] -me-px'
                      : 'text-[#3f4064] hover:bg-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  {(cat.children?.length ?? 0) > 0 && <ChevronLeft className="w-4 h-4 opacity-40" />}
                </button>
              ))}
              {!tree.length && (
                <p className="px-4 py-6 text-sm text-[var(--dk-muted)]">دسته‌بندی در دسترس نیست</p>
              )}
            </nav>
            <div className="flex-1 p-5 overflow-y-auto bg-white">
              {active && (
                <>
                  <Link
                    to={`/category/${active.commerceSlug || active.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[var(--dk-cta)] font-medium text-sm mb-4 hover:opacity-80"
                  >
                    همه محصولات {active.name}
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                  {children.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
                      {children.map((sub) => (
                        <div key={sub.slug}>
                          <Link
                            to={`/category/${sub.commerceSlug || sub.slug}`}
                            onClick={onClose}
                            className="text-sm font-semibold text-[#3f4064] hover:text-[var(--dk-cta)]"
                          >
                            {sub.name}
                          </Link>
                          {sub.children && sub.children.length > 0 && (
                            <ul className="mt-2 space-y-1.5">
                              {sub.children.map((leaf) => (
                                <li key={leaf.slug}>
                                  <Link
                                    to={`/category/${leaf.commerceSlug || leaf.slug}`}
                                    onClick={onClose}
                                    className="text-xs text-[var(--dk-muted)] hover:text-[var(--dk-cta)]"
                                  >
                                    {leaf.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--dk-muted)]">زیردسته‌ای وجود ندارد — روی لینک بالا کلیک کنید</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function MegaMenuTrigger({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
        active ? 'bg-[#fff0f2] text-[var(--dk-cta)]' : 'text-[#3f4064] hover:bg-[var(--dk-surface)]'
      }`}
    >
      <Menu className="w-5 h-5" />
      <span className="hidden sm:inline">دسته‌بندی کالاها</span>
    </button>
  );
}
