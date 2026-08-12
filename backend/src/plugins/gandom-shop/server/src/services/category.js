'use strict';

function mapCategoryRow(c, parentName) {
  return {
    id: c.id,
    documentId: c.documentId,
    name: c.name,
    slug: c.slug,
    commerceSlug: c.commerceSlug,
    description: c.description,
    menu_order: c.menu_order,
    show_in_menu: c.show_in_menu,
    published: !!c.publishedAt,
    parentId: c.parent?.id ?? c.parent ?? null,
    parentName: parentName || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

async function resolveParentDocumentId(strapi, parentId) {
  if (!parentId) return null;
  const parent = await strapi.db.query('api::nav-category.nav-category').findOne({
    where: { id: Number(parentId) },
  });
  return parent?.documentId || null;
}

module.exports = ({ strapi }) => ({
  async list(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50));
    const offset = (page - 1) * pageSize;

    const where = { publishedAt: { $notNull: true } };

    if (query.q) {
      const q = String(query.q).trim();
      if (q) {
        where.$or = [
          { name: { $containsi: q } },
          { slug: { $containsi: q } },
          { commerceSlug: { $containsi: q } },
        ];
      }
    }

    if (query.parentId === 'root' || query.parentId === '0') {
      where.parent = { id: { $null: true } };
    } else if (query.parentId) {
      where.parent = { id: Number(query.parentId) };
    }

    const [rows, total] = await Promise.all([
      strapi.db.query('api::nav-category.nav-category').findMany({
        where,
        populate: ['parent'],
        orderBy: [{ menu_order: 'asc' }, { name: 'asc' }],
        limit: pageSize,
        offset,
      }),
      strapi.db.query('api::nav-category.nav-category').count({ where }),
    ]);

    return {
      items: (rows || []).map((c) =>
        mapCategoryRow(c, c.parent && typeof c.parent === 'object' ? c.parent.name : null)
      ),
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize) || 0,
      },
    };
  },

  async parentOptions() {
    const roots = await strapi.db.query('api::nav-category.nav-category').findMany({
      where: { parent: { id: { $null: true } } },
      orderBy: { menu_order: 'asc' },
      limit: 100,
    });
    return (roots || []).map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  },

  async findOne(id) {
    const c = await strapi.db.query('api::nav-category.nav-category').findOne({
      where: { id: Number(id) },
      populate: ['parent'],
    });
    if (!c) return null;
    const parentName = c.parent && typeof c.parent === 'object' ? c.parent.name : null;
    return mapCategoryRow(c, parentName);
  },

  async create(data) {
    const parentDocumentId = await resolveParentDocumentId(strapi, data.parentId);
    const payload = {
      name: data.name,
      slug: data.slug,
      commerceSlug: data.commerceSlug || data.slug,
      description: data.description || '',
      menu_order: Number(data.menu_order) || 0,
      show_in_menu: data.show_in_menu !== false,
    };
    if (parentDocumentId) payload.parent = parentDocumentId;

    const doc = await strapi.documents('api::nav-category.nav-category').create({
      status: data.publish !== false ? 'published' : 'draft',
      data: payload,
    });

    const dbRow = await strapi.db.query('api::nav-category.nav-category').findOne({
      where: { documentId: doc.documentId, publishedAt: data.publish !== false ? { $notNull: true } : { $null: true } },
    });
    return dbRow ? this.findOne(dbRow.id) : mapCategoryRow(doc, null);
  },

  async update(id, data) {
    const existing = await strapi.db.query('api::nav-category.nav-category').findOne({
      where: { id: Number(id) },
    });
    if (!existing?.documentId) return null;

    const payload = {};
    if (data.name != null) payload.name = data.name;
    if (data.slug != null) payload.slug = data.slug;
    if (data.commerceSlug != null) payload.commerceSlug = data.commerceSlug;
    if (data.description != null) payload.description = data.description;
    if (data.menu_order != null) payload.menu_order = Number(data.menu_order);
    if (data.show_in_menu != null) payload.show_in_menu = !!data.show_in_menu;
    if (data.parentId !== undefined) {
      payload.parent = data.parentId ? await resolveParentDocumentId(strapi, data.parentId) : null;
    }

    await strapi.documents('api::nav-category.nav-category').update({
      documentId: existing.documentId,
      status: existing.publishedAt ? 'published' : 'draft',
      data: payload,
    });
    return this.findOne(id);
  },

  async remove(id) {
    const existing = await strapi.db.query('api::nav-category.nav-category').findOne({
      where: { id: Number(id) },
    });
    if (!existing?.documentId) return false;
    await strapi.documents('api::nav-category.nav-category').delete({
      documentId: existing.documentId,
    });
    return true;
  },
});
