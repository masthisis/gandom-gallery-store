import type { Core } from '@strapi/strapi';
import { seedPersianCatalog, seedHomepageSections } from './utils/seed-persian';
import { ensureShopOwnerRole, ensureShopOwnerUser } from './utils/shop-owner-role';
import { ensureSuperAdminUser } from './utils/super-admin-user';
import { registerNotificationHooks } from './utils/notification-hooks';
import { isMailConfigured, sendMail } from './utils/mailer';
import { notifyAdmin } from './utils/notify-admin';

async function ensurePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });
  if (!publicRole) return;

  const publicActions = [
    'plugin::webbycommerce.ecommerce.enable',
    'api::homepage.homepage.find',
    'api::page.page.find',
    'api::page.page.findOne',
    'api::store-setting.store-setting.find',
    'api::auth-otp.auth-otp.create',
    'api::category-tree.category-tree.find',
    'api::nav-category.nav-category.find',
    'api::nav-category.nav-category.findOne',
    'api::product-meta.product-meta.find',
    'api::product-meta.product-meta.findOne',
    'api::product-comment.product-comment.find',
  ];

  const authActions = [
    ...publicActions,
    'api::store-setting.store-setting.find',
    'api::product-comment.product-comment.create',
    'api::digipay.digipay.create',
  ];

  async function grant(role: any, actions: string[]) {
    for (const action of actions) {
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action, role: role.id },
      });
      if (!existing) {
        try {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: role.id },
          });
        } catch {
          /* action may not exist yet */
        }
      }
    }
  }

  await grant(publicRole, publicActions);
  if (authRole) await grant(authRole, authActions);

  // Revoke sensitive actions that must never stay on Public
  const revokeFromPublic = ['api::digipay.digipay.create', 'api::digipay.digipay.update'];
  for (const action of revokeFromPublic) {
    try {
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action, role: publicRole.id },
      });
      if (existing) {
        await strapi.db.query('plugin::users-permissions.permission').delete({
          where: { id: existing.id },
        });
      }
    } catch {
      /* ignore */
    }
  }
}

async function ensureDefaultSettings(strapi: Core.Strapi) {
  try {
    const sms = await strapi.documents('api::sms-setting.sms-setting').findFirst({});
    if (!sms) {
      await strapi.documents('api::sms-setting.sms-setting').create({
        data: { enabled: false, devMode: true, devOtpCode: '11111' },
      });
    }
  } catch (e) {
    strapi.log.warn('[bootstrap] sms-setting', e);
  }

  try {
    const pay = await strapi.documents('api::payment-setting.payment-setting').findFirst({});
    if (!pay) {
      await strapi.documents('api::payment-setting.payment-setting').create({
        data: {
          enabled: false,
          mockMode: true,
          baseUrl: 'https://uat.mydigipay.info',
          callbackUrl: process.env.DIGIPAY_CALLBACK_URL || 'http://localhost:5173/payment/callback',
        },
      });
    }
  } catch (e) {
    strapi.log.warn('[bootstrap] payment-setting', e);
  }

  try {
    const store = await strapi.documents('api::store-setting.store-setting').findFirst({});
    if (!store) {
      await strapi.documents('api::store-setting.store-setting').create({
        data: {
          storeName: 'گندم گالری',
          currencyLabel: 'تومان',
          shippingFlatToman: 45000,
          taxEnabled: false,
          lowStockThreshold: 5,
          phone: '02191000000',
          address: 'تهران',
        },
      });
    } else if ((store as { lowStockThreshold?: number | null }).lowStockThreshold == null) {
      await strapi.documents('api::store-setting.store-setting').update({
        documentId: store.documentId,
        data: { lowStockThreshold: 5 } as Record<string, unknown>,
      });
    }
  } catch (e) {
    strapi.log.warn('[bootstrap] store-setting', e);
  }

  try {
    const notif = await strapi.documents('api::notification-setting.notification-setting').findFirst({});
    if (!notif) {
      await strapi.documents('api::notification-setting.notification-setting').create({
        data: {
          enabled: false,
          adminEmail: process.env.SUPER_ADMIN_EMAIL || '',
          notifyLowStock: true,
          notifyPaymentFailed: true,
          notifyOrderPaid: false,
          notifyPendingComment: false,
        },
      });
    }
  } catch (e) {
    strapi.log.warn('[bootstrap] notification-setting', e);
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensurePublicPermissions(strapi);
    await ensureDefaultSettings(strapi);
    await ensureShopOwnerRole(strapi);
    await ensureSuperAdminUser(strapi);
    await ensureShopOwnerUser(strapi);
    try {
      registerNotificationHooks(strapi);
      // Expose mail helpers to JS plugins (gandom-shop)
      (strapi as any).gandomMail = { sendMail, isMailConfigured, notifyAdmin };
    } catch (e) {
      strapi.log.warn('[bootstrap] notification hooks', e);
    }
    if (process.env.GANDOM_SEED === 'true') {
      try {
        await seedPersianCatalog(strapi);
        // Always refresh homepage presentation when full demo seed runs
        await seedHomepageSections(strapi, { force: true });
      } catch (e) {
        strapi.log.warn('[bootstrap] seed', e);
      }
    } else {
      try {
        await seedHomepageSections(strapi);
      } catch (e) {
        strapi.log.warn('[bootstrap] homepage seed', e);
      }
    }
    strapi.log.info('[gandom] bootstrap complete — Admin: /admin (Shop Owner role)');
  },
};
