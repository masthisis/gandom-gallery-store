/**
 * Shared Digipay payment settings + OAuth helpers (JS — loadable from plugin)
 */

'use strict';

const MASK = '••••••••';
let cachedToken = null;

function clearDigipayTokenCache() {
  cachedToken = null;
}

function tomanToRial(toman) {
  return Math.round(Number(toman) * 10);
}

async function getPaymentSettings(strapi) {
  try {
    return (
      (await strapi.documents('api::payment-setting.payment-setting').findFirst({})) || {
        enabled: false,
        mockMode: true,
        baseUrl: 'https://uat.mydigipay.info',
      }
    );
  } catch {
    return { enabled: false, mockMode: true, baseUrl: 'https://uat.mydigipay.info' };
  }
}

function derivePaymentMode(settings) {
  if (settings.mockMode || !settings.enabled) return 'mock';
  return 'live';
}

function maskPaymentSettings(settings) {
  return {
    enabled: settings.enabled ?? false,
    mockMode: settings.mockMode ?? true,
    baseUrl: settings.baseUrl || 'https://uat.mydigipay.info',
    callbackUrl:
      settings.callbackUrl ||
      process.env.DIGIPAY_CALLBACK_URL ||
      'http://localhost:5173/payment/callback',
    clientId: settings.clientId ? MASK : '',
    clientSecret: settings.clientSecret ? MASK : '',
    username: settings.username ? MASK : '',
    password: settings.password ? MASK : '',
    hasClientId: !!settings.clientId,
    hasClientSecret: !!settings.clientSecret,
    hasUsername: !!settings.username,
    hasPassword: !!settings.password,
    mode: derivePaymentMode(settings),
  };
}

async function updatePaymentSettings(strapi, input) {
  const current = await getPaymentSettings(strapi);
  const data = {
    enabled: input.enabled != null ? Boolean(input.enabled) : current.enabled,
    mockMode: input.mockMode != null ? Boolean(input.mockMode) : current.mockMode,
    baseUrl: String(input.baseUrl || current.baseUrl || 'https://uat.mydigipay.info'),
    callbackUrl: String(
      input.callbackUrl ||
        current.callbackUrl ||
        process.env.DIGIPAY_CALLBACK_URL ||
        'http://localhost:5173/payment/callback'
    ),
    clientId:
      input.clientId && input.clientId !== MASK ? String(input.clientId) : current.clientId,
    clientSecret:
      input.clientSecret && input.clientSecret !== MASK
        ? String(input.clientSecret)
        : current.clientSecret,
    username:
      input.username && input.username !== MASK ? String(input.username) : current.username,
    password:
      input.password && input.password !== MASK ? String(input.password) : current.password,
  };

  const existing = await strapi.documents('api::payment-setting.payment-setting').findFirst({});
  if (existing?.documentId) {
    await strapi.documents('api::payment-setting.payment-setting').update({
      documentId: existing.documentId,
      data,
    });
  } else {
    await strapi.documents('api::payment-setting.payment-setting').create({ data });
  }
  clearDigipayTokenCache();
  return getPaymentSettings(strapi);
}

async function getAccessToken(settings) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.access;
  }
  const base = (settings.baseUrl || 'https://uat.mydigipay.info').replace(/\/$/, '');
  const basic = Buffer.from(`${settings.clientId}:${settings.clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    username: settings.username || '',
    password: settings.password || '',
    grant_type: 'password',
  });
  const res = await fetch(`${base}/digipay/api/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Digipay OAuth failed: ${res.status}`);
  }
  const data = await res.json();
  cachedToken = {
    access: data.access_token,
    refresh: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  };
  return cachedToken.access;
}

async function testDigipayConnection(settings) {
  try {
    await getAccessToken(settings);
    return { ok: true, message: 'اتصال به درگاه موفق بود' };
  } catch (err) {
    return { ok: false, message: err?.message || 'خطای اتصال' };
  }
}

module.exports = {
  clearDigipayTokenCache,
  tomanToRial,
  getPaymentSettings,
  maskPaymentSettings,
  derivePaymentMode,
  updatePaymentSettings,
  getAccessToken,
  testDigipayConnection,
};
