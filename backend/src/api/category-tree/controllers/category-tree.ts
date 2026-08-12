import { mediaUrl } from '../../../utils/media-url';

function mapNode(c: any): any {
  return {
    id: c.id,
    documentId: c.documentId,
    name: c.name,
    slug: c.slug,
    commerceSlug: c.commerceSlug || c.slug,
    description: c.description,
    menu_order: c.menu_order ?? 0,
    show_in_menu: c.show_in_menu !== false,
    image: mediaUrl(c.image),
    children: [],
  };
}

export default {
  async tree(ctx: any) {
    const strapi = global.strapi;

    // Prefer dedicated nav-category tree (editable in Strapi Admin)
    try {
      const rowsRaw = await strapi.db.query('api::nav-category.nav-category').findMany({
        populate: ['image', 'parent'],
        orderBy: [{ menu_order: 'asc' }, { name: 'asc' }],
      });
      // Document Service stores draft + published rows; keep one row per documentId.
      const byDocument = new Map<string, any>();
      for (const c of rowsRaw || []) {
        const key = c.documentId || `id:${c.id}`;
        const prev = byDocument.get(key);
        if (!prev || (c.publishedAt && !prev.publishedAt)) {
          byDocument.set(key, c);
        }
      }
      const rows = [...byDocument.values()];
      if (rows?.length) {
        const byId = new Map<number, any>();
        for (const c of rows) {
          if (c.show_in_menu === false) continue;
          byId.set(c.id, mapNode(c));
        }
        const roots: any[] = [];
        for (const c of rows) {
          if (c.show_in_menu === false) continue;
          const node = byId.get(c.id);
          if (!node) continue;
          const parentId = c.parent?.id || c.parent;
          if (parentId && byId.has(parentId)) {
            byId.get(parentId).children.push(node);
          } else {
            roots.push(node);
          }
        }
        roots.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
        for (const r of roots) {
          r.children.sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0));
        }
        ctx.body = { data: roots };
        return;
      }
    } catch (e) {
      strapi.log.warn('[category-tree] nav-category', e);
    }

    // Fallback: flat WebbyCommerce categories
    const rowsRaw = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
      populate: ['image'],
    });
    const byDocument = new Map<string, any>();
    for (const c of rowsRaw || []) {
      const key = c.documentId || `id:${c.id}`;
      const prev = byDocument.get(key);
      if (!prev || (c.publishedAt && !prev.publishedAt)) {
        byDocument.set(key, c);
      }
    }
    ctx.body = {
      data: [...byDocument.values()].map((c: any) => ({
        ...mapNode(c),
        commerceSlug: c.slug,
        children: [],
      })),
    };
  },
};
