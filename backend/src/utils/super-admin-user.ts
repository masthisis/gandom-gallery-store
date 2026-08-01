import type { Core } from '@strapi/strapi';

/**
 * Ensures production Super Admin (developer) exists from env.
 * Does not log the password. Updates password if SUPER_ADMIN_FORCE_PASSWORD=true.
 */
export async function ensureSuperAdminUser(strapi: Core.Strapi) {
  try {
    const email = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.SUPER_ADMIN_PASSWORD || '';
    if (!email || !password) {
      strapi.log.info('[gandom] SUPER_ADMIN_EMAIL/PASSWORD not set — skip super admin bootstrap');
      return;
    }

    const role = await strapi.db.query('admin::role').findOne({
      where: { code: 'strapi-super-admin' },
    });
    if (!role) {
      strapi.log.warn('[gandom] strapi-super-admin role missing');
      return;
    }

    const firstname = process.env.SUPER_ADMIN_FIRSTNAME || 'Developer';
    const lastname = process.env.SUPER_ADMIN_LASTNAME || 'Admin';
    const forcePassword = process.env.SUPER_ADMIN_FORCE_PASSWORD === 'true';

    const existing = await strapi.admin.services.user.findOneByEmail(email);
    if (existing) {
      const data: Record<string, unknown> = {
        roles: [role.id],
        isActive: true,
        firstname: existing.firstname || firstname,
        lastname: existing.lastname || lastname,
      };
      if (forcePassword) {
        data.password = password;
      }
      await strapi.admin.services.user.updateById(existing.id, data);
      strapi.log.info(`[gandom] Super Admin ensured for ${email}`);
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
    strapi.log.info(`[gandom] Super Admin created: ${email}`);
  } catch (e) {
    strapi.log.warn('[gandom] ensureSuperAdminUser', e);
  }
}
