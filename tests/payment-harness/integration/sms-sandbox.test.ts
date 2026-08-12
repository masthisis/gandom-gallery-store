import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  healthCheck,
  adminLogin,
  adminPutSmsSettings,
  adminTestSmsConnection,
  requestOtp,
  verifyOtp,
} from '../lib/api-client.js';
import { getUserOtp, resetSmsSettingsDev } from '../lib/assert-db.js';
import { RUN_SMS_SANDBOX, SMS_TEST_MOBILE, SMSIR_TEMPLATE_ID } from '../lib/config.js';

const describeSandbox = RUN_SMS_SANDBOX ? describe : describe.skip;

describeSandbox('sms harness (sandbox)', () => {
  let adminToken = '';

  beforeAll(async () => {
    const ok = await healthCheck();
    if (!ok) {
      throw new Error('Stack not healthy — run docker compose up');
    }
    adminToken = await adminLogin();
    await adminPutSmsSettings(adminToken, {
      enabled: true,
      devMode: false,
      templateId: SMSIR_TEMPLATE_ID,
      lineNumber: '30002108020007',
      adminMobile: SMS_TEST_MOBILE,
    });
  }, 120000);

  afterAll(async () => {
    if (adminToken) {
      await adminPutSmsSettings(adminToken, {
        enabled: false,
        devMode: true,
        templateId: SMSIR_TEMPLATE_ID,
      });
    }
    await resetSmsSettingsDev();
  });

  it('S1-1 admin test-connection succeeds for sandbox mobile', async () => {
    const res = await adminTestSmsConnection(adminToken, SMS_TEST_MOBILE);
    expect(res.status).toBeLessThan(400);
    const body = res.data as { ok?: boolean; status?: number; mobile?: string };
    expect(body.ok).toBe(true);
    expect(body.mobile).toBe(SMS_TEST_MOBILE);
    expect(body.status === 1 || body.status === true).toBe(true);
  });

  it('S1-2 request OTP in sandbox mode (no devHint)', async () => {
    const res = await requestOtp(SMS_TEST_MOBILE);
    expect(res.status).toBeLessThan(400);
    const body = res.data as { ok?: boolean; devHint?: string };
    expect(body.ok).toBe(true);
    expect(body.devHint).toBeUndefined();
  });

  it('S1-3 OTP stored in DB', async () => {
    await requestOtp(SMS_TEST_MOBILE);
    const otp = await getUserOtp(SMS_TEST_MOBILE);
    expect(otp).toBeTruthy();
    expect(otp).toMatch(/^\d{5}$/);
  });

  it('S1-4 verify DB OTP returns JWT', async () => {
    await requestOtp(SMS_TEST_MOBILE);
    const otp = await getUserOtp(SMS_TEST_MOBILE);
    expect(otp).toBeTruthy();
    const jwt = await verifyOtp(SMS_TEST_MOBILE, otp!);
    expect(jwt).toBeTruthy();
  });

  it('S1-5 invalid line number fails connection test', async () => {
    await adminPutSmsSettings(adminToken, {
      enabled: true,
      devMode: false,
      lineNumber: '00000000000001',
      templateId: SMSIR_TEMPLATE_ID,
    });
    const res = await adminTestSmsConnection(adminToken, SMS_TEST_MOBILE);
    const body = res.data as { ok?: boolean };
    expect(body.ok).toBe(false);
    await adminPutSmsSettings(adminToken, {
      enabled: true,
      devMode: false,
      lineNumber: '30002108020007',
      templateId: SMSIR_TEMPLATE_ID,
    });
  });
});
