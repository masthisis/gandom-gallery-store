/**
 * Subscribe to commerce lifecycle events for admin email notifications
 */

import { notifyAdmin } from './notify-admin';

/** Avoid spamming the same low-stock product within this window */
const lowStockCooldown = new Map<string, number>();
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

async function getLowStockThreshold(strapi: any): Promise<number> {
  try {
    const store = await strapi.documents('api::store-setting.store-setting').findFirst({});
    const n = Number(store?.lowStockThreshold);
    return Number.isFinite(n) && n >= 0 ? n : 5;
  } catch {
    return 5;
  }
}

async function maybeNotifyLowStock(strapi: any, product: any) {
  if (!product) return;
  const threshold = await getLowStockThreshold(strapi);
  const qty = Number(product.stock_quantity);
  if (!Number.isFinite(qty) || qty >= threshold) return;

  const key = String(product.id || product.documentId || product.slug);
  const last = lowStockCooldown.get(key) || 0;
  if (Date.now() - last < COOLDOWN_MS) return;
  lowStockCooldown.set(key, Date.now());

  await notifyAdmin(strapi, 'low_stock', {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    stock_quantity: qty,
    threshold,
  });
}

export function registerNotificationHooks(strapi: any) {
  strapi.db.lifecycles.subscribe({
    models: ['plugin::webbycommerce.product'],
    async afterCreate(event: any) {
      await maybeNotifyLowStock(strapi, event.result);
    },
    async afterUpdate(event: any) {
      const data = event.params?.data || {};
      if (!Object.prototype.hasOwnProperty.call(data, 'stock_quantity')) return;
      await maybeNotifyLowStock(strapi, event.result);
    },
  });

  strapi.db.lifecycles.subscribe({
    models: ['api::store-comment.store-comment'],
    async afterCreate(event: any) {
      const result = event.result;
      if (!result || result.is_visible) return;
      await notifyAdmin(strapi, 'pending_comment', {
        productSlug: result.productSlug,
        body: String(result.body || '').slice(0, 500),
        userId: result.user?.id || result.user,
        rating: result.rating,
      });
    },
  });

  strapi.log.info('[gandom] notification lifecycle hooks registered');
}
