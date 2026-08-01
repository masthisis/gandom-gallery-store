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
    const existing = await strapi.db.query('plugin::webbycommerce.product-category').findOne({
      where: { slug },
    });

    if (existing) {
      await strapi.db.query('plugin::webbycommerce.product-category').update({
        where: { id: existing.id },
        data: { name, slug },
      });
    } else {
      await strapi.db.query('plugin::webbycommerce.product-category').create({
        data: {
          name,
          slug,
          description: result.description || '',
        },
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
