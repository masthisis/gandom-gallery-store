/**
 * Auth OTP — phone login via SMS.ir
 */

import path from 'path';

const PLUGIN_USER = 'plugin::users-permissions.user';

function smsHelpers() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(path.join((strapi as any).dirs.app.root, 'src/utils/sms-settings.js'));
}

function notifySmsHelper() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(path.join((strapi as any).dirs.app.root, 'src/utils/notify-sms.js'));
}

function normalizePhone(raw: string): string {
  let p = String(raw || '').replace(/\D/g, '');
  if (p.startsWith('98') && p.length === 12) p = '0' + p.slice(2);
  if (p.startsWith('9') && p.length === 10) p = '0' + p;
  return p;
}

function isValidIranMobile(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export default {
  async request(ctx: any) {
    const { mobile: rawMobile } = ctx.request.body || {};
    const mobile = normalizePhone(rawMobile);
    if (!isValidIranMobile(mobile)) {
      return ctx.badRequest('شماره موبایل معتبر نیست');
    }

    const settings = await smsHelpers().getSmsSettings(strapi);
    const useDev = smsHelpers().isDevOtpMode(settings);
    const otpCode = useDev
      ? String(settings.devOtpCode || process.env.OTP_DEV_CODE || '11111')
      : String(Math.floor(10000 + Math.random() * 90000));
    const otpInt = parseInt(otpCode, 10);

    let user = await strapi.db.query(PLUGIN_USER).findOne({ where: { phone_no: mobile } });
    if (!user) {
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });
      const syntheticEmail = `${mobile}@users.gandom.local`;
      const username = `u${mobile.slice(-8)}`;
      user = await strapi.plugin('users-permissions').service('user').add({
        username,
        email: syntheticEmail,
        phone_no: mobile,
        confirmed: true,
        provider: 'local',
        role: authenticatedRole?.id,
      });
    }

    try {
      await strapi.db.connection('up_users').where({ id: user.id }).update({
        otp: otpInt,
        is_otp_verified: false,
      });
    } catch {
      await strapi.db.query(PLUGIN_USER).update({
        where: { id: user.id },
        data: { otp: otpInt, isOtpVerified: false },
      });
    }

    if (useDev) {
      strapi.log.info(`[auth-otp] DEV OTP for ${mobile}: ${otpCode}`);
    } else {
      const result = await smsHelpers().sendSmsEvent(strapi, 'auth_otp', {
        code: otpCode,
        mobile,
      });
      if (!result.ok && !result.skipped) {
        strapi.log.error('[auth-otp] SMS send failed', result);
        return ctx.badRequest('ارسال پیامک ناموفق بود');
      }
    }

    ctx.body = {
      ok: true,
      message: useDev ? 'کد تایید ارسال شد (حالت توسعه)' : 'کد تایید ارسال شد',
      mobile,
      ...(useDev && process.env.NODE_ENV !== 'production' ? { devHint: otpCode } : {}),
    };
  },

  async verify(ctx: any) {
    const { mobile: rawMobile, otp } = ctx.request.body || {};
    const mobile = normalizePhone(rawMobile);
    const code = String(otp || '').trim();

    if (!isValidIranMobile(mobile) || !code) {
      return ctx.badRequest('شماره یا کد نامعتبر است');
    }

    const settings = await smsHelpers().getSmsSettings(strapi);
    const useDev = smsHelpers().isDevOtpMode(settings);
    const devCode = String(settings.devOtpCode || process.env.OTP_DEV_CODE || '11111');

    const user = await strapi.db.query(PLUGIN_USER).findOne({ where: { phone_no: mobile } });
    if (!user) {
      return ctx.badRequest('کاربر یافت نشد؛ ابتدا درخواست کد دهید');
    }

    const storedOtp = user.otp != null ? String(user.otp) : null;
    const valid = (useDev && code === devCode) || (storedOtp && code === storedOtp);
    if (!valid) {
      return ctx.badRequest('کد تایید نادرست است');
    }

    try {
      await strapi.db.connection('up_users').where({ id: user.id }).update({
        otp: null,
        is_otp_verified: true,
        confirmed: true,
      });
    } catch {
      await strapi.db.query(PLUGIN_USER).update({
        where: { id: user.id },
        data: { otp: null, isOtpVerified: true, confirmed: true },
      });
    }

    const jwt = await strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

    ctx.body = {
      ok: true,
      jwt,
      user: {
        id: user.id,
        phone_no: mobile,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        display_name: user.display_name || user.first_name || mobile,
        email: user.email?.endsWith('@users.gandom.local') ? null : user.email,
      },
    };
  },
};
