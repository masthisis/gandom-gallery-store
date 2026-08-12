import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';
import { seedPersianCatalog, seedHomepageSections } from './utils/seed-persian';
import { ensureShopOwnerRole, ensureShopOwnerUser } from './utils/shop-owner-role';
import { ensureCmPersianLabels } from './utils/cm-persian-labels';
import { ensureSuperAdminUser } from './utils/super-admin-user';
import { registerNotificationHooks } from './utils/notification-hooks';

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
  const {
    DEFAULT_LINE_NUMBER,
    DEFAULT_ADMIN_MOBILE,
    mergeEventTemplates,
    isValidSmsLineNumber,
  } = require(path.join(strapi.dirs.app.root, 'src/utils/sms-event-templates.js'));

  try {
    const sms = await strapi.documents('api::sms-setting.sms-setting').findFirst({});
    const envApiKey = process.env.SMSIR_API_KEY || '';
    const envTemplateId = Number(process.env.SMSIR_TEMPLATE_ID) || 123456;
    const lineNumber = process.env.SMS_LINE_NUMBER || DEFAULT_LINE_NUMBER;
    const adminMobile = process.env.ADMIN_MOBILE || process.env.SMS_TEST_MOBILE || DEFAULT_ADMIN_MOBILE;
    const eventTemplates = mergeEventTemplates(null);

    if (!sms) {
      await strapi.documents('api::sms-setting.sms-setting').create({
        data: {
          enabled: !!envApiKey,
          devMode: true,
          devOtpCode: '11111',
          apiKey: envApiKey,
          templateId: envTemplateId,
          lineNumber,
          adminMobile,
          eventTemplates,
        },
      });
    } else {
      const patch: Record<string, unknown> = {};
      if (envApiKey && sms.apiKey !== envApiKey) {
        patch.apiKey = envApiKey;
        patch.templateId = envTemplateId;
        patch.enabled = true;
      }
      if (!isValidSmsLineNumber(sms.lineNumber)) patch.lineNumber = lineNumber;
      if (!sms.adminMobile) patch.adminMobile = adminMobile;
      if (!sms.eventTemplates) patch.eventTemplates = eventTemplates;
      if (Object.keys(patch).length) {
        await strapi.documents('api::sms-setting.sms-setting').update({
          documentId: sms.documentId,
          data: patch,
        });
        strapi.log.info('[bootstrap] SMS settings synced');
      }
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

function repairWebbycommerceFaJson(strapi: Core.Strapi) {
  const target = path.join(
    strapi.dirs.app.root,
    'node_modules/@webbycrown/webbycommerce/admin/src/translations/fa.json'
  );
  const minimal = {
    'webbycommerce.plugin.name': 'WebbyCommerce',
    'webbycommerce.plugin.description': 'Commerce',
  };
  try {
    if (!fs.existsSync(target)) return;
    const raw = fs.readFileSync(target, 'utf8').trim();
    if (raw.length > 2) {
      JSON.parse(raw);
      return;
    }
    fs.writeFileSync(target, `${JSON.stringify(minimal, null, 2)}\n`, 'utf8');
    strapi.log.info('[gandom] repaired empty webbycommerce admin fa.json');
  } catch {
    fs.writeFileSync(target, `${JSON.stringify(minimal, null, 2)}\n`, 'utf8');
    strapi.log.info('[gandom] wrote fallback webbycommerce admin fa.json');
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    repairWebbycommerceFaJson(strapi);
    await ensurePublicPermissions(strapi);
    await ensureDefaultSettings(strapi);
    await ensureShopOwnerRole(strapi);
    await ensureCmPersianLabels(strapi);
    await ensureSuperAdminUser(strapi);
    await ensureShopOwnerUser(strapi);
    try {
      registerNotificationHooks(strapi);
      const { notifySms } = require(path.join(strapi.dirs.app.root, 'src/utils/notify-sms.js'));
      (strapi as any).gandomSms = { notifySms };
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
