import { resolveUser } from '../../../utils/resolve-user';

async function hydrateProducts(strapi: any, slugs: string[]) {
  if (!slugs.length) return [] as { productSlug: string; product: Record<string, unknown> }[];
  const products: any[] = await strapi.db.query('plugin::webbycommerce.product').findMany({
    where: { slug: { $in: slugs } },
    limit: 100,
  });
  const bySlug = new Map<string, any>((products || []).map((p: any) => [p.slug, p]));
  return slugs.map((slug) => {
    const p = bySlug.get(slug);
    return {
      productSlug: slug,
      product: p
        ? {
            id: p.id,
            documentId: p.documentId,
            name: p.name,
            slug: p.slug,
            price: p.price,
            sale_price: p.sale_price,
            stock_status: p.stock_status,
          }
        : { slug, name: slug },
    };
  });
}

export default {
  async list(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    const rows = await strapi.db.query('api::favorite.favorite').findMany({
      where: { user: user.id },
      orderBy: { id: 'desc' },
      limit: 200,
    });
    const slugs = (rows || []).map((r: any) => r.productSlug as string);
    const items = await hydrateProducts(strapi, slugs);
    ctx.body = {
      data: (rows || []).map((r: any, i: number) => ({
        id: r.id,
        createdAt: r.createdAt,
        productSlug: items[i]?.productSlug || r.productSlug,
        product: items[i]?.product,
      })),
    };
  },

  async status(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');
    const slug = String(ctx.query.product || ctx.params.product || '');
    if (!slug) return ctx.badRequest('product required');
    const row = await strapi.db.query('api::favorite.favorite').findOne({
      where: { user: user.id, productSlug: slug },
    });
    ctx.body = { data: { favorited: !!row, id: row?.id || null } };
  },

  async add(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');
    const slug = String(ctx.request.body?.product || ctx.request.body?.productSlug || '');
    if (!slug) return ctx.badRequest('product required');

    let row = await strapi.db.query('api::favorite.favorite').findOne({
      where: { user: user.id, productSlug: slug },
    });
    if (!row) {
      row = await strapi.db.query('api::favorite.favorite').create({
        data: { user: user.id, productSlug: slug },
      });
    }
    ctx.body = { data: { id: row.id, productSlug: slug, favorited: true } };
  },

  async toggle(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');
    const slug = String(ctx.request.body?.product || ctx.request.body?.productSlug || '');
    if (!slug) return ctx.badRequest('product required');

    const existing = await strapi.db.query('api::favorite.favorite').findOne({
      where: { user: user.id, productSlug: slug },
    });
    if (existing) {
      await strapi.db.query('api::favorite.favorite').delete({ where: { id: existing.id } });
      ctx.body = { data: { favorited: false, productSlug: slug } };
      return;
    }
    const created = await strapi.db.query('api::favorite.favorite').create({
      data: { user: user.id, productSlug: slug },
    });
    ctx.body = { data: { favorited: true, id: created.id, productSlug: slug } };
  },

  async remove(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');
    const slug = String(ctx.params.product || ctx.request.body?.product || '');
    if (!slug) return ctx.badRequest('product required');
    const existing = await strapi.db.query('api::favorite.favorite').findOne({
      where: { user: user.id, productSlug: slug },
    });
    if (existing) {
      await strapi.db.query('api::favorite.favorite').delete({ where: { id: existing.id } });
    }
    ctx.body = { ok: true, data: { favorited: false } };
  },
};
