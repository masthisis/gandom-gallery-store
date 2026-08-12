'use strict';

/**
 * Keep WebbyCommerce product-category in sync with nav-category tree (by commerceSlug).
 */

async function upsertWcCategory(event) {
  const { result } = event;
  if (!result) return;

  const slug = String(result.commerceSlug || result.slug || '').trim();
  if (!slug) return;

  const name = String(result.name || slug);
  const strapi = global.strapi;

  try {
    const existing = await strapi.documents('plugin::webbycommerce.product-category').findMany({
      filters: { slug },
    });

    const data = {
      name,
      slug,
      description: result.description || '',
    };

    if (existing?.length) {
      await strapi.documents('plugin::webbycommerce.product-category').update({
        documentId: existing[0].documentId,
        status: 'published',
        data,
      });
    } else {
      await strapi.documents('plugin::webbycommerce.product-category').create({
        status: 'published',
        data,
      });
    }
  } catch (e) {
    strapi.log.warn('[nav-category] WC category sync failed', e?.message || e);
  }
}

module.exports = {
  async afterCreate(event) {
    await upsertWcCategory(event);
  },
  async afterUpdate(event) {
    await upsertWcCategory(event);
  },
};
