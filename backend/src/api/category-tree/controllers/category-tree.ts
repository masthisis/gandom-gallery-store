function mediaUrl(file: any): string | null {
  if (!file) return null;
  const url = file.url || file?.formats?.small?.url;
  if (!url) return null;
  if (String(url).startsWith('http')) return url;
  return `http://localhost:1337${url}`;
}

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
      const rows = await strapi.db.query('api::nav-category.nav-category').findMany({
        populate: ['image', 'parent'],
        orderBy: [{ menu_order: 'asc' }, { name: 'asc' }],
      });
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
    const rows = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
      populate: ['image'],
    });
    ctx.body = {
      data: (rows || []).map((c: any) => ({
        ...mapNode(c),
        commerceSlug: c.slug,
        children: [],
      })),
    };
  },
};
