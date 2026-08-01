/**
 * Public product meta (specs + gallery) — avoids users-permissions friction
 */

export default {
  async list(ctx: any) {
    const strapi = global.strapi;
    const slug = ctx.query.slug ? String(ctx.query.slug) : null;
    const where = slug ? { productSlug: slug } : {};
    const rows = await strapi.db.query('api::product-meta.product-meta').findMany({
      where,
      limit: 200,
    });
    ctx.body = {
      data: (rows || []).map((r: any) => ({
        id: r.id,
        productSlug: r.productSlug,
        specifications: r.specifications || [],
        gallery_urls: r.gallery_urls || [],
      })),
    };
  },
};
