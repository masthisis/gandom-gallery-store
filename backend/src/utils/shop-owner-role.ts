import type { Core } from '@strapi/strapi';

const CONTENT_SUBJECTS = [
  'api::homepage.homepage',
  'api::page.page',
  'api::store-setting.store-setting',
  'api::sms-setting.sms-setting',
  'api::payment-setting.payment-setting',
  'api::nav-category.nav-category',
  'api::product-meta.product-meta',
  'api::store-comment.store-comment',
  'api::favorite.favorite',
  'plugin::webbycommerce.product',
  'plugin::webbycommerce.product-category',
  'plugin::webbycommerce.order',
  'plugin::webbycommerce.coupon',
  'plugin::webbycommerce.product-review',
  'plugin::webbycommerce.address',
  'plugin::webbycommerce.payment-transaction',
  'plugin::users-permissions.user',
];

const EXPLORER_ACTIONS = [
  'plugin::content-manager.explorer.create',
  'plugin::content-manager.explorer.read',
  'plugin::content-manager.explorer.update',
  'plugin::content-manager.explorer.delete',
  'plugin::content-manager.explorer.publish',
];

const GLOBAL_ACTIONS = [
  'plugin::upload.read',
  'plugin::upload.assets.create',
  'plugin::upload.assets.update',
  'plugin::upload.assets.download',
  'plugin::upload.assets.copy-link',
];

/**
 * Ensures Shop Owner admin role (Content Manager + Media + payments + customers).
 */
export async function ensureShopOwnerRole(strapi: Core.Strapi) {
  try {
    const roleService = strapi.admin.services.role;
    let role = await strapi.db.query('admin::role').findOne({
      where: { code: 'shop-owner' },
    });

    if (!role) {
      role = await roleService.create({
        name: 'مالک فروشگاه',
        code: 'shop-owner',
        description: 'محصولات، سفارش‌ها، پرداخت‌ها، دسته‌بندی‌ها، صفحه اصلی، دیدگاه‌ها، مشتریان',
      });
      strapi.log.info('[gandom] Created Shop Owner admin role');
    } else if (role.name !== 'مالک فروشگاه') {
      try {
        await strapi.db.query('admin::role').update({
          where: { id: role.id },
          data: {
            name: 'مالک فروشگاه',
            description: 'محصولات، سفارش‌ها، پرداخت‌ها، دسته‌بندی‌ها، صفحه اصلی، دیدگاه‌ها، مشتریان',
          },
        });
      } catch {
        /* ignore rename failures */
      }
    }

    const permissions: any[] = [];
    for (const subject of CONTENT_SUBJECTS) {
      for (const action of EXPLORER_ACTIONS) {
        permissions.push({ action, subject, conditions: [] });
      }
    }
    for (const action of GLOBAL_ACTIONS) {
      permissions.push({ action, subject: null, conditions: [] });
    }

    try {
      await roleService.assignPermissions(role.id, permissions);
      strapi.log.info(`[gandom] Shop Owner permissions synced (${permissions.length})`);
    } catch (err: any) {
      strapi.log.warn('[gandom] bulk assignPermissions failed, inserting one-by-one', err?.message || err);
      let ok = 0;
      for (const p of permissions) {
        try {
          const exists = await strapi.db.query('admin::permission').findOne({
            where: { action: p.action, subject: p.subject, role: role.id },
          });
          if (!exists) {
            await strapi.db.query('admin::permission').create({
              data: { action: p.action, subject: p.subject, role: role.id, conditions: [] },
            });
          }
          ok += 1;
        } catch {
          /* skip invalid action/subject combos */
        }
      }
      strapi.log.info(`[gandom] Shop Owner permissions inserted ~${ok}`);
    }

    return role;
  } catch (e) {
    strapi.log.warn('[gandom] ensureShopOwnerRole', e);
    return null;
  }
}

/**
 * Creates/updates Shop Owner admin from env.
 * With SHOP_OWNER_FORCE_PASSWORD=true, resets password on each boot (use carefully).
 */
export async function ensureShopOwnerUser(strapi: Core.Strapi) {
  try {
    const role = await strapi.db.query('admin::role').findOne({
      where: { code: 'shop-owner' },
    });
    if (!role) return;

    const email = (process.env.SHOP_OWNER_EMAIL || 'owner@gandom.local').trim().toLowerCase();
    const password = process.env.SHOP_OWNER_PASSWORD || 'GandomOwner123!';
    const firstname = process.env.SHOP_OWNER_FIRSTNAME || 'مالک';
    const lastname = process.env.SHOP_OWNER_LASTNAME || 'فروشگاه';
    const forcePassword = process.env.SHOP_OWNER_FORCE_PASSWORD === 'true';

    const byEmail = await strapi.admin.services.user.findOneByEmail(email);
    if (byEmail) {
      const existingRoles = await strapi.db.query('admin::user').findOne({
        where: { id: byEmail.id },
        populate: ['roles'],
      });
      const roleIds = [
        ...new Set([
          ...((existingRoles?.roles || []).map((r: any) => r.id)),
          role.id,
        ]),
      ];
      const data: Record<string, unknown> = {
        roles: roleIds,
        isActive: true,
      };
      if (forcePassword) data.password = password;
      await strapi.admin.services.user.updateById(byEmail.id, data);
      strapi.log.info(`[gandom] Shop Owner admin ensured: ${email}`);
      return;
    }

    const existingOwners = await strapi.db.query('admin::user').findMany({
      where: { roles: { id: role.id } },
      limit: 1,
    });
    if (existingOwners?.length && !forcePassword) {
      strapi.log.info('[gandom] Shop Owner admin user already exists');
      return;
    }

    await strapi.admin.services.user.create({
      email,
      password,
      firstname,
      lastname,
      roles: [role.id],
      isActive: true,
    });

    strapi.log.info(`[gandom] Shop Owner admin created: ${email}`);
  } catch (e) {
    strapi.log.warn('[gandom] ensureShopOwnerUser', e);
  }
}
