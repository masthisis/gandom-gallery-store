'use strict';

const DEFAULT_LINE_NUMBER = '30002108020007';
const DEFAULT_ADMIN_MOBILE = '09366531567';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/** SMS.ir line numbers are long numeric strings (typically 14 digits, e.g. 3000…). */
function isValidSmsLineNumber(value) {
  const digits = digitsOnly(value);
  return digits.length >= 10;
}

function normalizeSmsLineNumber(value, fallback = DEFAULT_LINE_NUMBER) {
  const digits = digitsOnly(value);
  if (isValidSmsLineNumber(digits)) return digits;
  const fb = digitsOnly(fallback);
  return isValidSmsLineNumber(fb) ? fb : DEFAULT_LINE_NUMBER;
}

const DEFAULT_EVENT_TEMPLATES = {
  auth_otp: {
    enabled: true,
    notifyAdmin: false,
    notifyCustomer: true,
    adminMessage: '',
    customerMessage: 'کد ورود گندم گالری: {code}',
    useVerifyApi: false,
  },
  low_stock: {
    enabled: true,
    notifyAdmin: true,
    notifyCustomer: false,
    adminMessage: 'هشدار موجودی کم: {name} — {qty} عدد (آستانه {threshold})',
    customerMessage: '',
    useVerifyApi: false,
  },
  order_paid: {
    enabled: true,
    notifyAdmin: true,
    notifyCustomer: true,
    adminMessage: 'سفارش پرداخت شد: {orderNumber} — {amountToman} تومان',
    customerMessage: 'پرداخت شما با موفقیت انجام شد. سفارش {orderNumber}',
    useVerifyApi: false,
  },
  payment_failed: {
    enabled: true,
    notifyAdmin: true,
    notifyCustomer: true,
    adminMessage: 'پرداخت ناموفق: {orderNumber}',
    customerMessage: 'پرداخت سفارش {orderNumber} ناموفق بود. لطفاً دوباره تلاش کنید.',
    useVerifyApi: false,
  },
  pending_comment: {
    enabled: true,
    notifyAdmin: true,
    notifyCustomer: false,
    adminMessage: 'دیدگاه جدید برای {productSlug} در انتظار تأیید',
    customerMessage: '',
    useVerifyApi: false,
  },
};

const EVENT_LABELS_FA = {
  auth_otp: 'ورود با کد یکبارمصرف',
  low_stock: 'موجودی کم',
  order_paid: 'پرداخت موفق سفارش',
  payment_failed: 'پرداخت ناموفق',
  pending_comment: 'دیدگاه در انتظار تأیید',
};

const CUSTOMER_EVENTS = new Set(['auth_otp', 'order_paid', 'payment_failed']);

const SAMPLE_PAYLOADS = {
  auth_otp: { code: '12345', mobile: DEFAULT_ADMIN_MOBILE },
  low_stock: {
    name: 'محصول تست',
    qty: 2,
    stock_quantity: 2,
    threshold: 5,
    slug: 'test-product',
    sku: 'SKU-TEST',
  },
  order_paid: {
    orderNumber: 'TEST-ORDER-001',
    order_number: 'TEST-ORDER-001',
    providerId: 'TEST-ORDER-001',
    amountToman: 150000,
    ticket: 'TEST-TICKET',
    phone: DEFAULT_ADMIN_MOBILE,
    mobile: DEFAULT_ADMIN_MOBILE,
  },
  payment_failed: {
    orderNumber: 'TEST-ORDER-001',
    order_number: 'TEST-ORDER-001',
    providerId: 'TEST-ORDER-001',
    amountToman: 150000,
    ticket: 'TEST-TICKET',
    status: 'FAILED',
    phone: DEFAULT_ADMIN_MOBILE,
    mobile: DEFAULT_ADMIN_MOBILE,
  },
  pending_comment: {
    productSlug: 'ceramic-vase-gandom',
    body: 'این یک دیدگاه آزمایشی است',
    userId: 1,
  },
};

function mergeEventTemplates(saved) {
  const out = {};
  for (const key of Object.keys(DEFAULT_EVENT_TEMPLATES)) {
    out[key] = { ...DEFAULT_EVENT_TEMPLATES[key], ...(saved?.[key] || {}) };
  }
  return out;
}

module.exports = {
  DEFAULT_LINE_NUMBER,
  DEFAULT_ADMIN_MOBILE,
  DEFAULT_EVENT_TEMPLATES,
  EVENT_LABELS_FA,
  CUSTOMER_EVENTS,
  SAMPLE_PAYLOADS,
  mergeEventTemplates,
  digitsOnly,
  isValidSmsLineNumber,
  normalizeSmsLineNumber,
};
