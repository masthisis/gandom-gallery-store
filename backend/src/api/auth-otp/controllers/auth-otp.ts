/**
 * Auth OTP — phone login via SMS.ir (dev OTP 11111)
 */

const PLUGIN_USER = 'plugin::users-permissions.user';

function normalizePhone(raw: string): string {
  let p = String(raw || '').replace(/\D/g, '');
  if (p.startsWith('98') && p.length === 12) p = '0' + p.slice(2);
  if (p.startsWith('9') && p.length === 10) p = '0' + p;
  return p;
}

function isValidIranMobile(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

async function getSmsSettings(strapi: any) {
  try {
    const settings = await strapi.documents('api::sms-setting.sms-setting').findFirst({});
    return (
      settings || {
        enabled: false,
        devMode: true,
        devOtpCode: '11111',
        apiKey: null,
        templateId: null,
        lineNumber: null,
      }
    );
  } catch {
    return { enabled: false, devMode: true, devOtpCode: '11111' };
  }
}

/** Dev OTP only outside production (or ALLOW_DEV_OTP_IN_PRODUCTION=true emergency) */
function isDevOtpMode(settings: any): boolean {
  if (process.env.NODE_ENV === 'production') {
    return settings.devMode === true && process.env.ALLOW_DEV_OTP_IN_PRODUCTION === 'true';
  }
  return settings.devMode !== false;
}

async function sendSmsIrVerify(settings: any, mobile: string, code: string) {
  if (!settings.apiKey || !settings.templateId) {
    throw new Error('SMS settings incomplete');
  }
  const res = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': settings.apiKey,
    },
    body: JSON.stringify({
      mobile,
      templateId: Number(settings.templateId),
      parameters: [{ name: 'CODE', value: code }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SMS.ir error: ${res.status} ${text}`);
  }
  return res.json();
}

export default {
  async request(ctx: any) {
    const { mobile: rawMobile } = ctx.request.body || {};
    const mobile = normalizePhone(rawMobile);
    if (!isValidIranMobile(mobile)) {
      return ctx.badRequest('شماره موبایل معتبر نیست');
    }

    const settings = await getSmsSettings(strapi);
    const useDev = isDevOtpMode(settings);
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

    if (useDev || !settings.enabled) {
      strapi.log.info(`[auth-otp] DEV OTP for ${mobile}: ${otpCode}`);
    } else {
      try {
        await sendSmsIrVerify(settings, mobile, otpCode);
      } catch (err: any) {
        strapi.log.error('[auth-otp] SMS send failed', err);
        return ctx.badRequest('ارسال پیامک ناموفق بود');
      }
    }

    ctx.body = {
      ok: true,
      message: useDev || !settings.enabled ? 'کد تایید ارسال شد (حالت توسعه)' : 'کد تایید ارسال شد',
      mobile,
      // Never expose OTP in API responses in production
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

    const settings = await getSmsSettings(strapi);
    const useDev = isDevOtpMode(settings);
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
