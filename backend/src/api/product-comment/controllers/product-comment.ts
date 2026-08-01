/**
 * Product comments — moderated (is_visible default false) + threaded replies
 */

import { resolveUser } from '../../../utils/resolve-user';

function mapComment(r: any) {
  return {
    id: r.id,
    documentId: r.documentId,
    rating: r.rating,
    review: r.body || r.review,
    body: r.body,
    is_visible: r.is_visible,
    createdAt: r.createdAt,
    parentId: r.parent?.id || r.parent || null,
    user: r.user
      ? {
          id: r.user.id,
          display_name: r.user.display_name || r.user.username || r.user.phone_no,
        }
      : null,
    replies: Array.isArray(r.replies)
      ? r.replies
          .filter((x: any) => x.is_visible)
          .map((x: any) => mapComment(x))
      : [],
  };
}

export default {
  async list(ctx: any) {
    const strapi = global.strapi;
    const slug = String(ctx.query.product || ctx.params.product || '');
    if (!slug) return ctx.badRequest('product required');

    const rows = await strapi.db.query('api::store-comment.store-comment').findMany({
      where: {
        productSlug: slug,
        is_visible: true,
        parent: { $null: true },
      },
      populate: ['user', 'replies', 'replies.user'],
      orderBy: { id: 'desc' },
      limit: 100,
    });

    // Also include legacy WC visible reviews (seeded) without replies
    let legacy: any[] = [];
    try {
      const product =
        (await strapi.db.query('plugin::webbycommerce.product').findOne({
          where: { $or: [{ slug }, { documentId: slug }] },
        })) ||
        (await strapi.db.query('plugin::webbycommerce.product').findOne({
          where: { id: Number(slug) || 0 },
        }));
      if (product) {
        const reviews = await strapi.db.query('plugin::webbycommerce.product-review').findMany({
          where: {
            product: product.id,
            $or: [{ is_visible: true }, { is_visible: { $null: true } }],
          },
          populate: ['user'],
          orderBy: { id: 'desc' },
          limit: 50,
        });
        legacy = (reviews || []).map((r: any) => ({
          id: `wc-${r.id}`,
          rating: r.rating,
          review: r.review,
          body: r.review,
          is_visible: true,
          createdAt: r.createdAt,
          parentId: null,
          user: r.user
            ? {
                id: r.user.id,
                display_name: r.user.display_name || r.user.username || r.user.phone_no,
              }
            : null,
          replies: [],
          legacy: true,
        }));
      }
    } catch {
      /* ignore */
    }

    ctx.body = {
      data: [...(rows || []).map(mapComment), ...legacy],
    };
  },

  async create(ctx: any) {
    const strapi = global.strapi;
    const user = ctx.state.user || (await resolveUser(ctx, strapi));
    if (!user) return ctx.unauthorized('برای ثبت دیدگاه وارد شوید');

    const { product: productRef, rating, review, body, parentId, parent } = ctx.request.body || {};
    const text = String(body || review || '').trim();
    if (!productRef || !text) return ctx.badRequest('محصول و متن دیدگاه الزامی است');
    if (text.length < 5) return ctx.badRequest('متن دیدگاه کوتاه است');
    if (text.length > 4000) return ctx.badRequest('متن دیدگاه بیش از حد طولانی است');

    const parentRef = parentId || parent || null;
    let parentRow: any = null;
    if (parentRef) {
      parentRow = await strapi.db.query('api::store-comment.store-comment').findOne({
        where: {
          id: Number(parentRef) || 0,
          productSlug: String(productRef),
        },
      });
      if (!parentRow) return ctx.badRequest('دیدگاه والد یافت نشد');
    }

    const stars = parentRow ? null : Math.min(5, Math.max(1, Number(rating) || 5));

    const created = await strapi.db.query('api::store-comment.store-comment').create({
      data: {
        productSlug: String(productRef),
        body: text.slice(0, 4000),
        rating: stars,
        is_visible: false,
        user: user.id,
        parent: parentRow?.id || null,
      },
    });

    ctx.body = {
      data: {
        id: created.id,
        rating: created.rating,
        review: created.body,
        body: created.body,
        is_visible: false,
        pendingApproval: true,
        parentId: parentRow?.id || null,
        user: {
          id: user.id,
          display_name: user.display_name || user.username || user.phone_no,
        },
      },
      message: 'دیدگاه شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود',
    };
  },
};
