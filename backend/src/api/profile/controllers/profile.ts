import { resolveUser } from '../../../utils/resolve-user';
import {
  validateAddressParts,
  toWcAddress,
  normalizeIranMobile,
  isValidPersianName,
} from '../../../utils/iran-validation';
import { applyCheckoutProfile } from '../../../utils/apply-checkout-profile';

function mapUser(u: any) {
  return {
    id: u.id,
    phone_no: u.phone_no,
    first_name: u.first_name,
    last_name: u.last_name,
    display_name: u.display_name,
    email: u.email,
  };
}

function mapAddress(a: any) {
  return {
    id: a.id,
    documentId: a.documentId,
    first_name: a.first_name,
    last_name: a.last_name,
    region: a.region,
    city: a.city,
    street_address: a.street_address,
    postcode: a.postcode,
    phone: a.phone,
    country: a.country,
    type: a.type,
  };
}

export default {
  async me(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    let addresses: any[] = [];
    try {
      addresses = await strapi.db.query('plugin::webbycommerce.address').findMany({
        where: { user: user.id },
        orderBy: { id: 'desc' },
        limit: 50,
      });
    } catch {
      addresses = [];
    }

    ctx.body = { data: { user: mapUser(user), addresses: (addresses || []).map(mapAddress) } };
  },

  async updateMe(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    const body = ctx.request.body || {};
    const data: Record<string, string> = {};

    if (body.first_name != null || body.firstName != null) {
      const v = String(body.first_name ?? body.firstName).trim();
      if (!isValidPersianName(v)) return ctx.badRequest('نام نامعتبر است');
      data.first_name = v;
    }
    if (body.last_name != null || body.lastName != null) {
      const v = String(body.last_name ?? body.lastName).trim();
      if (!isValidPersianName(v)) return ctx.badRequest('نام خانوادگی نامعتبر است');
      data.last_name = v;
    }
    if (body.display_name != null || body.displayName != null) {
      data.display_name = String(body.display_name ?? body.displayName).trim().slice(0, 80);
    }
    if (body.phone != null || body.phone_no != null) {
      const phone = normalizeIranMobile(String(body.phone ?? body.phone_no));
      if (!phone) return ctx.badRequest('موبایل نامعتبر است');
      data.phone_no = phone;
    }
    if (!data.display_name && (data.first_name || data.last_name)) {
      data.display_name = `${data.first_name || user.first_name || ''} ${data.last_name || user.last_name || ''}`.trim();
    }

    const updated = await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data,
    });
    ctx.body = { data: mapUser(updated) };
  },

  async createAddress(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    const validated = validateAddressParts(ctx.request.body || {});
    if (!validated.ok) return ctx.badRequest(validated.errors.join('، '));

    try {
      const created = await strapi.db.query('plugin::webbycommerce.address').create({
        data: {
          ...toWcAddress(validated.data, Number(ctx.request.body?.type) || 1),
          user: user.id,
        },
      });
      ctx.body = { data: mapAddress(created) };
    } catch (e: any) {
      strapi.log.error('[profile] createAddress', e);
      return ctx.badRequest(e.message || 'خطا در ذخیره آدرس');
    }
  },

  async updateAddress(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    const id = Number(ctx.params.id);
    const existing = await strapi.db.query('plugin::webbycommerce.address').findOne({
      where: { id, user: user.id },
    });
    if (!existing) return ctx.notFound('آدرس یافت نشد');

    const validated = validateAddressParts(ctx.request.body || {});
    if (!validated.ok) return ctx.badRequest(validated.errors.join('، '));

    const updated = await strapi.db.query('plugin::webbycommerce.address').update({
      where: { id },
      data: toWcAddress(validated.data, Number(ctx.request.body?.type) || existing.type || 1),
    });
    ctx.body = { data: mapAddress(updated) };
  },

  async deleteAddress(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    const id = Number(ctx.params.id);
    const existing = await strapi.db.query('plugin::webbycommerce.address').findOne({
      where: { id, user: user.id },
    });
    if (!existing) return ctx.notFound('آدرس یافت نشد');

    await strapi.db.query('plugin::webbycommerce.address').delete({ where: { id } });
    ctx.body = { ok: true };
  },

  /** Persist checkout form after successful payment (client or digipay callback) */
  async saveFromCheckout(ctx: any) {
    const strapi = global.strapi;
    const user = await resolveUser(ctx, strapi);
    if (!user) return ctx.unauthorized('وارد شوید');

    const result = await applyCheckoutProfile(strapi, user.id, ctx.request.body || {});
    if (!result.ok) return ctx.badRequest(result.errors.join('، '));
    ctx.body = { ok: true, data: result.data };
  },
};
