/**
 * Shared SMS.ir settings + send helpers (JS — loadable from plugin)
 */

'use strict';

const {
  DEFAULT_LINE_NUMBER,
  DEFAULT_ADMIN_MOBILE,
  DEFAULT_EVENT_TEMPLATES,
  mergeEventTemplates,
  SAMPLE_PAYLOADS,
  isValidSmsLineNumber,
  normalizeSmsLineNumber,
} = require('./sms-event-templates.js');

const MASK = '••••••••';
const DEFAULT_TEST_MOBILE = DEFAULT_ADMIN_MOBILE;

async function getSmsSettings(strapi) {
  try {
    const doc =
      (await strapi.documents('api::sms-setting.sms-setting').findFirst({})) || {};
    return normalizeSettings(doc);
  } catch {
    return normalizeSettings({});
  }
}

function normalizeSettings(raw) {
  const lineFallback = process.env.SMS_LINE_NUMBER || DEFAULT_LINE_NUMBER;
  return {
    enabled: raw.enabled ?? false,
    devMode: raw.devMode ?? true,
    devOtpCode: raw.devOtpCode || '11111',
    apiKey: raw.apiKey || process.env.SMSIR_API_KEY || null,
    templateId: raw.templateId ?? (Number(process.env.SMSIR_TEMPLATE_ID) || 123456),
    lineNumber: normalizeSmsLineNumber(raw.lineNumber, lineFallback),
    adminMobile: raw.adminMobile || process.env.ADMIN_MOBILE || process.env.SMS_TEST_MOBILE || DEFAULT_ADMIN_MOBILE,
    eventTemplates: mergeEventTemplates(raw.eventTemplates),
  };
}

function deriveSmsMode(settings) {
  if (settings.devMode || !settings.enabled) return 'dev';
  return 'live';
}

function maskSmsSettings(settings) {
  return {
    enabled: settings.enabled ?? false,
    devMode: settings.devMode ?? true,
    devOtpCode: settings.devOtpCode || '11111',
    templateId: settings.templateId ?? null,
    lineNumber: settings.lineNumber || DEFAULT_LINE_NUMBER,
    adminMobile: settings.adminMobile || DEFAULT_ADMIN_MOBILE,
    eventTemplates: settings.eventTemplates || mergeEventTemplates(null),
    apiKey: settings.apiKey ? MASK : '',
    hasApiKey: !!settings.apiKey,
    mode: deriveSmsMode(settings),
  };
}

async function updateSmsSettings(strapi, input) {
  const current = await getSmsSettings(strapi);
  const mergedTemplates = input.eventTemplates
    ? mergeEventTemplates({ ...current.eventTemplates, ...input.eventTemplates })
    : current.eventTemplates;

  const data = {
    enabled: input.enabled != null ? Boolean(input.enabled) : current.enabled,
    devMode: input.devMode != null ? Boolean(input.devMode) : current.devMode,
    devOtpCode: String(input.devOtpCode || current.devOtpCode || '11111'),
    templateId:
      input.templateId != null && input.templateId !== ''
        ? Number(input.templateId)
        : current.templateId,
    lineNumber: normalizeSmsLineNumber(
      input.lineNumber != null ? input.lineNumber : current.lineNumber,
      current.lineNumber || DEFAULT_LINE_NUMBER
    ),
    adminMobile:
      input.adminMobile != null ? String(input.adminMobile) : current.adminMobile || DEFAULT_ADMIN_MOBILE,
    eventTemplates: mergedTemplates,
    apiKey:
      input.apiKey && input.apiKey !== MASK ? String(input.apiKey) : current.apiKey,
  };

  const existing = await strapi.documents('api::sms-setting.sms-setting').findFirst({});
  if (existing?.documentId) {
    await strapi.documents('api::sms-setting.sms-setting').update({
      documentId: existing.documentId,
      data,
    });
  } else {
    await strapi.documents('api::sms-setting.sms-setting').create({ data });
  }
  return getSmsSettings(strapi);
}

function isDevOtpMode(settings) {
  return settings.devMode === true;
}

function renderSmsTemplate(template, payload) {
  if (!template) return '';
  let out = String(template);
  const map = {
    code: payload.code,
    name: payload.name,
    qty: payload.qty ?? payload.stock_quantity,
    threshold: payload.threshold,
    slug: payload.slug,
    sku: payload.sku,
    orderNumber: payload.orderNumber ?? payload.order_number ?? payload.providerId,
    amountToman: payload.amountToman,
    ticket: payload.ticket,
    productSlug: payload.productSlug,
    body: payload.body,
    status: payload.status,
  };
  for (const [key, val] of Object.entries(map)) {
    if (val != null && val !== '') {
      out = out.replace(new RegExp(`\\{${key}\\}`, 'gi'), String(val));
    }
  }
  return out;
}

function getEventTemplate(settings, eventKey) {
  const templates = settings.eventTemplates || mergeEventTemplates(null);
  return { ...DEFAULT_EVENT_TEMPLATES[eventKey], ...(templates[eventKey] || {}) };
}

async function parseSmsIrResponse(res) {
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { status: 0, message: text };
  }
  if (!res.ok) {
    throw new Error(`SMS.ir error: ${res.status} ${text}`);
  }
  if (json.status !== 1 && json.status !== true) {
    throw new Error(json.message || 'SMS.ir request failed');
  }
  return json;
}

async function sendSmsIrVerify(settings, mobile, code) {
  if (!settings.apiKey || !settings.templateId) {
    throw new Error('SMS settings incomplete');
  }
  const res = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'X-API-KEY': settings.apiKey,
    },
    body: JSON.stringify({
      mobile,
      templateId: Number(settings.templateId),
      parameters: [{ name: 'CODE', value: String(code) }],
    }),
  });
  return parseSmsIrResponse(res);
}

async function sendSmsIrBulk(settings, mobiles, messageText) {
  if (!settings.apiKey || !settings.lineNumber) {
    throw new Error('SMS settings incomplete (apiKey, lineNumber)');
  }
  const lineNumber = normalizeSmsLineNumber(settings.lineNumber);
  if (!isValidSmsLineNumber(lineNumber)) {
    throw new Error('شماره خط پیامک نامعتبر است — در تنظیمات پیامک مقدار 30002108020007 را وارد کنید');
  }
  const list = (Array.isArray(mobiles) ? mobiles : [mobiles]).filter(Boolean);
  if (!list.length) {
    throw new Error('No mobile recipients');
  }
  const res = await fetch('https://api.sms.ir/v1/send/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'X-API-KEY': settings.apiKey,
    },
    body: JSON.stringify({
      lineNumber,
      messageText: String(messageText),
      mobiles: list,
      sendDateTime: null,
    }),
  });
  return parseSmsIrResponse(res);
}

async function sendSmsToMobile(settings, mobile, messageText, eventTpl, payload) {
  if (eventTpl.useVerifyApi && payload.code != null) {
    return sendSmsIrVerify(settings, mobile, payload.code);
  }
  return sendSmsIrBulk(settings, mobile, messageText);
}

async function resolveCustomerPhone(strapi, payload) {
  if (payload.mobile) return String(payload.mobile);
  if (payload.phone) return String(payload.phone);
  if (payload.cellNumber) return String(payload.cellNumber);
  const userId = payload.userId;
  if (!userId) return null;
  try {
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: Number(userId) || 0 },
    });
    return user?.phone_no || null;
  } catch {
    return null;
  }
}

/**
 * Send SMS for an event. Respects enabled toggles unless options.testMode.
 */
async function sendSmsEvent(strapi, eventKey, payload = {}, options = {}) {
  const settings = await getSmsSettings(strapi);
  const eventTpl = getEventTemplate(settings, eventKey);
  const testMode = options.testMode === true;
  const forceMobile = options.forceMobile || null;

  if (!testMode) {
    if (!settings.enabled) {
      return { ok: false, skipped: true, reason: 'sms_disabled' };
    }
    if (!eventTpl.enabled) {
      return { ok: false, skipped: true, reason: 'event_disabled' };
    }
  }

  if (!settings.apiKey) {
    return { ok: false, skipped: true, reason: 'no_api_key' };
  }

  const results = [];
  const normalizedPayload = { ...payload };

  if (eventKey === 'auth_otp' && !testMode && isDevOtpMode(settings)) {
    strapi.log.info(`[sms] auth_otp devMode skip send to ${payload.mobile}`);
    return { ok: true, skipped: true, reason: 'otp_dev_mode' };
  }

  const adminMobile = forceMobile || settings.adminMobile || DEFAULT_ADMIN_MOBILE;
  const customerMobile =
    forceMobile || (await resolveCustomerPhone(strapi, normalizedPayload));

  const sendAdmin = testMode || eventTpl.notifyAdmin;
  const sendCustomer = testMode || eventTpl.notifyCustomer;

  if (sendAdmin && eventTpl.adminMessage) {
    const text = renderSmsTemplate(eventTpl.adminMessage, normalizedPayload);
    if (text.trim()) {
      try {
        const raw = await sendSmsToMobile(settings, adminMobile, text, eventTpl, normalizedPayload);
        results.push({ recipient: 'admin', mobile: adminMobile, ok: true, raw });
      } catch (err) {
        results.push({ recipient: 'admin', mobile: adminMobile, ok: false, error: err.message });
      }
    }
  }

  if (sendCustomer && eventTpl.customerMessage && customerMobile) {
    const text = renderSmsTemplate(eventTpl.customerMessage, normalizedPayload);
    if (text.trim()) {
      try {
        const raw = await sendSmsToMobile(settings, customerMobile, text, eventTpl, normalizedPayload);
        results.push({ recipient: 'customer', mobile: customerMobile, ok: true, raw });
      } catch (err) {
        results.push({ recipient: 'customer', mobile: customerMobile, ok: false, error: err.message });
      }
    }
  }

  const anyOk = results.some((r) => r.ok);
  const allOk = results.length > 0 && results.every((r) => r.ok);
  return { ok: anyOk || results.length === 0, results, event: eventKey };
}

async function testSmsConnection(strapi, { mobile } = {}) {
  const settings = await getSmsSettings(strapi);
  const testMobile = mobile || process.env.SMS_TEST_MOBILE || DEFAULT_TEST_MOBILE;
  if (!settings.apiKey) {
    return { ok: false, message: 'کلید API تنظیم نشده است', mobile: testMobile };
  }
  try {
    const text = 'تست اتصال گندم گالری';
    const raw = await sendSmsIrBulk(settings, testMobile, text);
    return {
      ok: true,
      message: raw.message || 'اتصال به SMS.ir موفق بود',
      status: raw.status,
      mobile: testMobile,
      raw,
    };
  } catch (err) {
    return { ok: false, message: err?.message || 'خطای اتصال', mobile: testMobile };
  }
}

async function testSmsEvent(strapi, eventKey, { mobile } = {}) {
  const testMobile = mobile || process.env.SMS_TEST_MOBILE || DEFAULT_TEST_MOBILE;
  const sample = { ...(SAMPLE_PAYLOADS[eventKey] || {}), mobile: testMobile, phone: testMobile };
  return sendSmsEvent(strapi, eventKey, sample, { testMode: true, forceMobile: testMobile });
}

async function testAllSmsEvents(strapi, { mobile } = {}) {
  const testMobile = mobile || process.env.SMS_TEST_MOBILE || DEFAULT_TEST_MOBILE;
  const events = Object.keys(DEFAULT_EVENT_TEMPLATES);
  const results = [];
  for (const eventKey of events) {
    const result = await testSmsEvent(strapi, eventKey, { mobile: testMobile });
    results.push({ event: eventKey, ...result });
  }
  const ok = results.every((r) => r.ok);
  return { ok, mobile: testMobile, results };
}

function getSmsGoLiveChecklist(settings, connectionResult) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    hasApiKey: !!settings.apiKey,
    hasLineNumber: !!settings.lineNumber,
    hasAdminMobile: !!settings.adminMobile,
    enabledOn: !!settings.enabled,
    devModeOff: !settings.devMode,
    connectionOk: connectionResult?.ok === true,
    isProduction: isProd,
    readyForProduction:
      !!settings.apiKey &&
      !!settings.lineNumber &&
      !!settings.adminMobile &&
      !!settings.enabled &&
      !settings.devMode &&
      connectionResult?.ok === true,
  };
}

module.exports = {
  MASK,
  DEFAULT_TEST_MOBILE,
  getSmsSettings,
  maskSmsSettings,
  deriveSmsMode,
  updateSmsSettings,
  isDevOtpMode,
  renderSmsTemplate,
  getEventTemplate,
  sendSmsIrVerify,
  sendSmsIrBulk,
  sendSmsEvent,
  testSmsConnection,
  testSmsEvent,
  testAllSmsEvents,
  getSmsGoLiveChecklist,
  mergeEventTemplates,
};
