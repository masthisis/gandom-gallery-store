import { beforeAll, describe, expect, it } from 'vitest';
import {
  healthCheck,
  requestOtp,
  verifyOtp,
  loginWithOtp,
} from '../lib/api-client.js';
import { findUserByPhone, getUserOtp } from '../lib/assert-db.js';
import { OTP_DEV_CODE, TEST_MOBILE } from '../lib/config.js';

describe('sms harness (dev mode)', () => {
  beforeAll(async () => {
    const ok = await healthCheck();
    if (!ok) {
      throw new Error('Stack not healthy — run docker compose up');
    }
  }, 60000);

  it('S0-1 stack healthy', async () => {
    expect(await healthCheck()).toBe(true);
  });

  it('S0-2 request OTP returns dev hint', async () => {
    const res = await requestOtp(TEST_MOBILE);
    expect(res.status).toBeLessThan(400);
    const body = res.data as { ok?: boolean; devHint?: string };
    expect(body.ok).toBe(true);
    expect(body.devHint).toBe(OTP_DEV_CODE);
  });

  it('S0-3 verify dev OTP returns JWT', async () => {
    const jwt = await loginWithOtp(TEST_MOBILE);
    expect(jwt).toBeTruthy();
  });

  it('S0-4 invalid mobile rejected', async () => {
    const res = await requestOtp('123');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('S0-5 wrong OTP rejected', async () => {
    await requestOtp(TEST_MOBILE);
    await expect(verifyOtp(TEST_MOBILE, '99999')).rejects.toThrow();
  });

  it('S0-6 user exists in DB after request', async () => {
    await requestOtp(TEST_MOBILE);
    const user = await findUserByPhone(TEST_MOBILE);
    expect(user).toBeTruthy();
    expect(user?.phone_no).toBe(TEST_MOBILE);
  });

  it('S0-7 OTP cleared after verify', async () => {
    await requestOtp(TEST_MOBILE);
    await verifyOtp(TEST_MOBILE, OTP_DEV_CODE);
    const otp = await getUserOtp(TEST_MOBILE);
    expect(otp).toBeNull();
  });
});
