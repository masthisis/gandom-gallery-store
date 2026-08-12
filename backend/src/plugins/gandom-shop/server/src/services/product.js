'use strict';

function mapProductRow(p, categoriesById) {
  const cats = Array.isArray(p.product_categories)
    ? p.product_categories.map((c) => (typeof c === 'object' ? c : categoriesById[c])).filter(Boolean)
    : [];
  const categorySummary =
    cats.length > 0
      ? { primary: cats[0].name, extraCount: Math.max(0, cats.length - 1) }
      : { primary: null, extraCount: 0 };
  return {
    id: p.id,
    documentId: p.documentId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    sale_price: p.sale_price,
    sku: p.sku,
    stock_quantity: p.stock_quantity,
    stock_status: p.stock_status,
    weight: p.weight,
    specifications: p.specifications,
    gallery_urls: p.gallery_urls,
    published: !!p.publishedAt,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    categories: cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    categorySummary,
    imageIds: Array.isArray(p.images)
      ? p.images.map((img) => (typeof img === 'object' ? img.id : img)).filter(Boolean)
      : [],
  };
}

async function resolveCategoryIds(strapi, categorySlug) {
  if (!categorySlug) return null;
  const slug = String(categorySlug).trim();
  if (!slug) return null;

  const nav = await strapi.db.query('api::nav-category.nav-category').findOne({
    where: { $or: [{ slug }, { commerceSlug: slug }] },
  });
  const wcSlug = nav?.commerceSlug || nav?.slug || slug;

  const wcCat = await strapi.db.query('plugin::webbycommerce.product-category').findOne({
    where: { slug: wcSlug },
  });
  return wcCat ? [wcCat.id] : [];
}

async function resolveWcCategoryDocumentIds(strapi, categoryIds, categorySlugs) {
  if (Array.isArray(categoryIds) && categoryIds.length) {
    const cats = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
      where: { id: { $in: categoryIds.map(Number) } },
    });
    return [...new Set((cats || []).map((c) => c.documentId).filter(Boolean))];
  }
  if (!Array.isArray(categorySlugs) || !categorySlugs.length) return [];
  const docIds = [];
  for (const slug of categorySlugs) {
    const resolved = await resolveCategoryIds(strapi, slug);
    if (!resolved?.length) continue;
    const cats = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
      where: { id: { $in: resolved } },
    });
    for (const c of cats || []) {
      if (c.documentId) docIds.push(c.documentId);
    }
  }
  return [...new Set(docIds)];
}

async function findProductDbRow(strapi, documentId, published = true) {
  return strapi.db.query('plugin::webbycommerce.product').findOne({
    where: {
      documentId,
      publishedAt: published ? { $notNull: true } : { $null: true },
    },
  });
}

module.exports = ({ strapi }) => ({
  async list(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
    const offset = (page - 1) * pageSize;

    const where = {};

    if (query.q) {
      const q = String(query.q).trim();
      if (q) {
        where.$or = [
          { name: { $containsi: q } },
          { slug: { $containsi: q } },
          { sku: { $containsi: q } },
        ];
      }
    }

    if (query.stockStatus) {
      where.stock_status = String(query.stockStatus);
    }

    if (query.priceMin != null && query.priceMin !== '') {
      where.price = { ...(where.price || {}), $gte: Number(query.priceMin) };
    }
    if (query.priceMax != null && query.priceMax !== '') {
      where.price = { ...(where.price || {}), $lte: Number(query.priceMax) };
    }

    if (query.published === 'true') {
      where.publishedAt = { $notNull: true };
    } else if (query.published === 'false') {
      where.publishedAt = { $null: true };
    }

    const categoryIds = await resolveCategoryIds(strapi, query.category);
    if (categoryIds !== null) {
      if (!categoryIds.length) {
        return { items: [], pagination: { page, pageSize, total: 0, pageCount: 0 } };
      }
      where.product_categories = { id: { $in: categoryIds } };
    }

    const [rows, total] = await Promise.all([
      strapi.db.query('plugin::webbycommerce.product').findMany({
        where,
        populate: ['product_categories', 'images'],
        orderBy: { id: 'desc' },
        limit: pageSize,
        offset,
      }),
      strapi.db.query('plugin::webbycommerce.product').count({ where }),
    ]);

    const allCatIds = new Set();
    for (const p of rows || []) {
      for (const c of p.product_categories || []) {
        const id = typeof c === 'object' ? c.id : c;
        if (id) allCatIds.add(id);
      }
    }
    const categoriesById = {};
    if (allCatIds.size) {
      const cats = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
        where: { id: { $in: [...allCatIds] } },
      });
      for (const c of cats || []) categoriesById[c.id] = c;
    }

    return {
      items: (rows || []).map((p) => mapProductRow(p, categoriesById)),
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize) || 0,
      },
    };
  },

  async findOne(id) {
    const p = await strapi.db.query('plugin::webbycommerce.product').findOne({
      where: { id: Number(id) },
      populate: ['product_categories', 'images'],
    });
    if (!p) return null;

    const catIds = (p.product_categories || []).map((c) => (typeof c === 'object' ? c.id : c));
    const categoriesById = {};
    if (catIds.length) {
      const cats = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
        where: { id: { $in: catIds } },
      });
      for (const c of cats || []) categoriesById[c.id] = c;
    }
    return mapProductRow(p, categoriesById);
  },

  async create(data) {
    const categoryDocIds = await resolveWcCategoryDocumentIds(
      strapi,
      data.categoryIds,
      data.categorySlugs
    );
    const payload = {
      name: data.name,
      slug: data.slug || undefined,
      description: data.description || '',
      price: Number(data.price) || 0,
      sale_price: data.sale_price != null ? Number(data.sale_price) : null,
      sku: data.sku || null,
      stock_quantity: Number(data.stock_quantity) || 0,
      stock_status: data.stock_status || 'in_stock',
      weight: data.weight != null ? Number(data.weight) : null,
      specifications: data.specifications || null,
      gallery_urls: data.gallery_urls || null,
    };
    if (categoryDocIds.length) payload.product_categories = categoryDocIds;
    if (Array.isArray(data.imageIds) && data.imageIds.length) {
      payload.images = data.imageIds;
    }
    const publish = data.publish !== false;
    const doc = await strapi.documents('plugin::webbycommerce.product').create({
      status: publish ? 'published' : 'draft',
      data: payload,
    });
    const dbRow = await findProductDbRow(strapi, doc.documentId, publish);
    return dbRow ? this.findOne(dbRow.id) : null;
  },

  async update(id, data) {
    const existing = await strapi.db.query('plugin::webbycommerce.product').findOne({
      where: { id: Number(id) },
    });
    if (!existing?.documentId) return null;

    const payload = {};
    if (data.name != null) payload.name = data.name;
    if (data.slug != null) payload.slug = data.slug;
    if (data.description != null) payload.description = data.description;
    if (data.price != null) payload.price = Number(data.price);
    if (data.sale_price !== undefined) payload.sale_price = data.sale_price != null ? Number(data.sale_price) : null;
    if (data.sku !== undefined) payload.sku = data.sku;
    if (data.stock_quantity != null) payload.stock_quantity = Number(data.stock_quantity);
    if (data.stock_status != null) payload.stock_status = data.stock_status;
    if (data.weight !== undefined) payload.weight = data.weight != null ? Number(data.weight) : null;
    if (data.specifications !== undefined) payload.specifications = data.specifications;
    if (data.gallery_urls !== undefined) payload.gallery_urls = data.gallery_urls;
    if (Array.isArray(data.categoryIds) || Array.isArray(data.categorySlugs)) {
      payload.product_categories = await resolveWcCategoryDocumentIds(
        strapi,
        data.categoryIds,
        data.categorySlugs
      );
    }
    if (Array.isArray(data.imageIds)) payload.images = data.imageIds;

    await strapi.documents('plugin::webbycommerce.product').update({
      documentId: existing.documentId,
      status: existing.publishedAt ? 'published' : 'draft',
      data: payload,
    });
    return this.findOne(id);
  },

  async remove(id) {
    const existing = await strapi.db.query('plugin::webbycommerce.product').findOne({
      where: { id: Number(id) },
    });
    if (!existing?.documentId) return false;
    await strapi.documents('plugin::webbycommerce.product').delete({
      documentId: existing.documentId,
    });
    return true;
  },

  async setPublished(id, publish) {
    const existing = await strapi.db.query('plugin::webbycommerce.product').findOne({
      where: { id: Number(id) },
    });
    if (!existing?.documentId) return null;
    if (publish) {
      await strapi.documents('plugin::webbycommerce.product').publish({
        documentId: existing.documentId,
      });
    } else {
      await strapi.documents('plugin::webbycommerce.product').unpublish({
        documentId: existing.documentId,
      });
    }
    return this.findOne(id);
  },

  async categoryOptions() {
    const navRoots = await strapi.db.query('api::nav-category.nav-category').findMany({
      where: { parent: { id: { $null: true } } },
      orderBy: { menu_order: 'asc' },
      limit: 200,
    });
    return (navRoots || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      commerceSlug: c.commerceSlug || c.slug,
    }));
  },
});
