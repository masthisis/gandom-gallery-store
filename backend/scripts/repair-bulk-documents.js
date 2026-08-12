#!/usr/bin/env node
'use strict';

/**
 * Purge ghost bulk seed rows (db.query inserts invisible in Content Manager)
 * and re-seed via Document Service.
 *
 * Run inside Strapi container:
 *   docker exec gandom_strapi_dev node scripts/repair-bulk-documents.js
 */

const path = require('path');

// Skip bootstrap auto-seed; this script controls reseed timing.
process.env.GANDOM_SEED = 'false';
process.env.GANDOM_SEED_FORCE = 'false';

async function countBulk(strapi) {
  const [nav, wc, products] = await Promise.all([
    strapi.db.query('api::nav-category.nav-category').count({
      where: { slug: { $startsWith: 'bulk-cat-' } },
    }),
    strapi.db.query('plugin::webbycommerce.product-category').count({
      where: { slug: { $startsWith: 'bulk-cat-' } },
    }),
    strapi.db.query('plugin::webbycommerce.product').count({
      where: { slug: { $startsWith: 'bulk-p-' } },
    }),
  ]);
  return { nav, wc, products };
}

async function purgeBulkGhostData(strapi) {
  const knex = strapi.db.connection;

  await knex.raw(`
    DELETE FROM products_product_categories_lnk
    WHERE product_id IN (SELECT id FROM products WHERE slug LIKE 'bulk-p-%')
  `);
  await knex.raw(`
    DELETE FROM product_reviews_product_lnk
    WHERE product_id IN (SELECT id FROM products WHERE slug LIKE 'bulk-p-%')
  `);
  await knex.raw(`DELETE FROM products WHERE slug LIKE 'bulk-p-%'`);

  await knex.raw(`
    DELETE FROM nav_categories_parent_lnk
    WHERE nav_category_id IN (SELECT id FROM nav_categories WHERE slug LIKE 'bulk-cat-%')
       OR inv_nav_category_id IN (SELECT id FROM nav_categories WHERE slug LIKE 'bulk-cat-%')
  `);
  await knex.raw(`DELETE FROM nav_categories WHERE slug LIKE 'bulk-cat-%'`);

  await knex.raw(`
    DELETE FROM products_product_categories_lnk
    WHERE product_category_id IN (SELECT id FROM product_categories WHERE slug LIKE 'bulk-cat-%')
  `);
  await knex.raw(`DELETE FROM product_categories WHERE slug LIKE 'bulk-cat-%'`);

  await knex.raw(`DELETE FROM product_metas WHERE product_slug LIKE 'bulk-p-%'`);
}

async function countCmDocuments(strapi) {
  const [nav, wc] = await Promise.all([
    strapi.documents('api::nav-category.nav-category').findMany({ status: 'published' }),
    strapi.documents('plugin::webbycommerce.product-category').findMany({ status: 'published' }),
  ]);
  return { nav: nav?.length || 0, wc: wc?.length || 0 };
}

async function main() {
  const seedPath = path.join(__dirname, '..', 'dist', 'src', 'utils', 'seed-persian.js');
  const { compileStrapi, createStrapi } = require('@strapi/strapi');

  console.log('[repair] compiling Strapi…');
  const appContext = await compileStrapi();
  const strapi = createStrapi(appContext);
  await strapi.load();

  try {
    const before = await countBulk(strapi);
    console.log('[repair] bulk rows before purge:', before);

    await purgeBulkGhostData(strapi);
    console.log('[repair] ghost bulk rows deleted');

    const { seedPersianCatalog } = require(seedPath);
    console.log('[repair] re-seeding catalog via Document Service…');
    await seedPersianCatalog(strapi);

    const afterBulk = await countBulk(strapi);
    const cm = await countCmDocuments(strapi);
    console.log('[repair] bulk rows after reseed:', afterBulk);
    console.log('[repair] CM-visible published documents:', cm);
    console.log('[repair] done — verify admin Content Manager category lists');
  } finally {
    try {
      await strapi.destroy();
    } catch {
      /* pool teardown noise in dev */
    }
  }
}

main().catch((err) => {
  console.error('[repair] failed:', err);
  process.exit(1);
});
