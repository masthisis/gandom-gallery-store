import type { CategoryItem } from '../components/dk/types';

export function categoryLinkSlug(c: CategoryItem): string {
  return c.commerceSlug || c.slug;
}

export function findCategoryNode(tree: CategoryItem[], slug: string): CategoryItem | null {
  if (!slug) return null;
  for (const node of tree) {
    if (node.slug === slug || node.commerceSlug === slug) return node;
    if (node.children?.length) {
      const found = findCategoryNode(node.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export function collectDescendantSlugs(node: CategoryItem): Set<string> {
  const slugs = new Set<string>();
  function walk(n: CategoryItem) {
    if (n.slug) slugs.add(n.slug);
    if (n.commerceSlug && n.commerceSlug !== n.slug) slugs.add(n.commerceSlug);
    for (const child of n.children || []) walk(child);
  }
  walk(node);
  return slugs;
}

export function getFilterSlugsForCategory(tree: CategoryItem[], slug: string): Set<string> {
  const node = findCategoryNode(tree, slug);
  if (node) return collectDescendantSlugs(node);
  return new Set([slug]);
}

export function findCategoryPath(
  tree: CategoryItem[],
  slug: string
): CategoryItem[] {
  for (const node of tree) {
    if (node.slug === slug || node.commerceSlug === slug) return [node];
    if (node.children?.length) {
      const sub = findCategoryPath(node.children, slug);
      if (sub.length) return [node, ...sub];
    }
  }
  return [];
}

export function collectAncestorSlugs(tree: CategoryItem[], slug: string): Set<string> {
  const path = findCategoryPath(tree, slug);
  const slugs = new Set<string>();
  for (const node of path) {
    slugs.add(categoryLinkSlug(node));
  }
  return slugs;
}
