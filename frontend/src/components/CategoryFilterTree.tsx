import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import type { CategoryItem } from './dk/types';
import { categoryLinkSlug, collectAncestorSlugs } from '../lib/categoryTree';

type Props = {
  tree: CategoryItem[];
  activeSlug?: string;
};

function nodeKey(c: CategoryItem): string {
  return categoryLinkSlug(c);
}

function isActive(c: CategoryItem, activeSlug?: string): boolean {
  if (!activeSlug) return false;
  const link = categoryLinkSlug(c);
  return link === activeSlug || c.slug === activeSlug || c.commerceSlug === activeSlug;
}

function CategoryNode({
  node,
  depth,
  activeSlug,
  expanded,
  onToggle,
}: {
  node: CategoryItem;
  depth: number;
  activeSlug?: string;
  expanded: Set<string>;
  onToggle: (key: string) => void;
}) {
  const key = nodeKey(node);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const open = expanded.has(key);
  const active = isActive(node, activeSlug);

  return (
    <li>
      <div
        className="flex items-center gap-0.5"
        style={{ paddingInlineStart: depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(key)}
            className="shrink-0 p-1 rounded hover:bg-[var(--dk-surface)] text-[var(--dk-muted)]"
            aria-expanded={open}
            aria-label={open ? 'بستن زیردسته‌ها' : 'نمایش زیردسته‌ها'}
          >
            {open ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" aria-hidden />
        )}
        <Link
          to={`/category/${key}`}
          className={`flex-1 min-w-0 py-1.5 px-2 rounded-lg text-sm truncate hover:bg-[var(--dk-surface)] ${
            active ? 'text-[var(--dk-cta)] font-medium bg-[#fff0f2]' : 'text-[#3f4064]'
          }`}
        >
          {node.name}
        </Link>
      </div>
      {hasChildren && open && (
        <ul className="space-y-0.5 mt-0.5">
          {node.children!.map((child) => (
            <CategoryNode
              key={nodeKey(child)}
              node={child}
              depth={depth + 1}
              activeSlug={activeSlug}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryFilterTree({ tree, activeSlug }: Props) {
  const defaultExpanded = useMemo(() => {
    if (!activeSlug) return new Set<string>();
    return collectAncestorSlugs(tree, activeSlug);
  }, [tree, activeSlug]);

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <h3 className="font-bold text-sm text-[#3f4064] mb-3">دسته‌بندی</h3>
      <ul className="space-y-0.5 max-h-64 overflow-y-auto text-sm">
        <li>
          <Link
            to="/shop"
            className={`block py-1.5 px-2 rounded-lg hover:bg-[var(--dk-surface)] ${
              !activeSlug ? 'text-[var(--dk-cta)] font-medium bg-[#fff0f2]' : 'text-[#3f4064]'
            }`}
          >
            همه محصولات
          </Link>
        </li>
        {tree.map((node) => (
          <CategoryNode
            key={nodeKey(node)}
            node={node}
            depth={0}
            activeSlug={activeSlug}
            expanded={expanded}
            onToggle={toggle}
          />
        ))}
      </ul>
    </div>
  );
}
