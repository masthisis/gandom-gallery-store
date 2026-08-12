import { beforeAll, describe, expect, it } from 'vitest';
import { healthCheck, adminLogin, adminTestAllSms, adminPutSmsSettings } from '../lib/api-client.js';
import { RUN_SMS_LIVE, SMS_TEST_MOBILE, SMSIR_API_KEY_LIVE, SMS_LINE_NUMBER } from '../lib/config.js';

const describeLive = RUN_SMS_LIVE ? describe : describe.skip;

describeLive('sms notifications (live — all events)', () => {
  let adminToken = '';

  beforeAll(async () => {
    if (!SMSIR_API_KEY_LIVE) {
      throw new Error(
        'SMSIR_API_KEY_LIVE is required for dashboard-visible sends. Add production key to backend/.env'
      );
    }
    const ok = await healthCheck();
    if (!ok) throw new Error('Stack not healthy — run docker compose up');
    adminToken = await adminLogin();
    await adminPutSmsSettings(adminToken, {
      enabled: true,
      devMode: false,
      apiKey: SMSIR_API_KEY_LIVE,
      lineNumber: SMS_LINE_NUMBER,
      adminMobile: SMS_TEST_MOBILE,
    });
  }, 120000);

  it('N1-1 sends all SMS event types to test mobile', async () => {
    const res = await adminTestAllSms(adminToken, SMS_TEST_MOBILE);
    expect(res.status).toBeLessThan(400);
    const body = res.data as { ok?: boolean; mobile?: string; results?: Array<{ ok?: boolean }> };
    expect(body.ok).toBe(true);
    expect(body.mobile).toBe(SMS_TEST_MOBILE);
    expect(body.results?.length).toBeGreaterThanOrEqual(5);
    for (const r of body.results || []) {
      expect(r.ok).toBe(true);
    }
  }, 120000);
});
