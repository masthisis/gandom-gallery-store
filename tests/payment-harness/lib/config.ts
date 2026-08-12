export const API_URL = process.env.API_URL || 'http://localhost:1337';
export const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';
export const WC_PREFIX = process.env.WC_PREFIX || '/api/webbycommerce';
export const DIGIPAY_STUB_PORT = Number(process.env.DIGIPAY_STUB_PORT || 9191);
export const DIGIPAY_STUB_HOST = process.env.DIGIPAY_STUB_HOST || '127.0.0.1';
export const DIGIPAY_STUB_URL = `http://${DIGIPAY_STUB_HOST}:${DIGIPAY_STUB_PORT}`;

export const SHOP_OWNER_EMAIL = process.env.SHOP_OWNER_EMAIL || 'owner@gandom.local';
export const SHOP_OWNER_PASSWORD = process.env.SHOP_OWNER_PASSWORD || 'GandomOwner123!';
export const OTP_DEV_CODE = process.env.OTP_DEV_CODE || '11111';
export const DIGIPAY_REFUND_SECRET = process.env.DIGIPAY_REFUND_SECRET || 'change-me-long-random';

export const SMS_TEST_MOBILE = process.env.SMS_TEST_MOBILE || '09366531567';
export const SMS_LINE_NUMBER = process.env.SMS_LINE_NUMBER || '30002108020007';
export const SMSIR_TEMPLATE_ID = Number(process.env.SMSIR_TEMPLATE_ID || 123456);
export const SMSIR_API_KEY_LIVE = process.env.SMSIR_API_KEY_LIVE || '';
export const RUN_SMS_SANDBOX = process.env.RUN_SMS_SANDBOX === '1';
export const RUN_SMS_LIVE = process.env.RUN_SMS_LIVE === '1';

export const TEST_MOBILE = '09121234567';
export const TEST_PRODUCT_SLUG = process.env.TEST_PRODUCT_SLUG || 'ceramic-vase-gandom';

export const PG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME || 'strapi',
  user: process.env.DATABASE_USERNAME || 'strapi',
  password: process.env.DATABASE_PASSWORD || 'strapi',
  connectionTimeoutMillis: 5000,
};
