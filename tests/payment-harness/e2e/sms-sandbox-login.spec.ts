import { test, expect } from '@playwright/test';
import pg from 'pg';
import { PG, RUN_SMS_SANDBOX, SMS_TEST_MOBILE } from '../lib/config.js';

const API = process.env.API_URL || 'http://localhost:1337';

async function getOtpFromDb(phone: string): Promise<string | null> {
  const client = new pg.Client(PG);
  await client.connect();
  try {
    const res = await client.query(`SELECT otp FROM up_users WHERE phone_no = $1 LIMIT 1`, [
      phone,
    ]);
    const otp = res.rows[0]?.otp;
    return otp != null ? String(otp) : null;
  } finally {
    await client.end();
  }
}

test.skip(!RUN_SMS_SANDBOX, 'sandbox E2E requires RUN_SMS_SANDBOX=1');

test('storefront sandbox OTP login via DB OTP', async ({ page }) => {
  await fetch(`${API}/api/auth-otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: SMS_TEST_MOBILE }),
  });

  const otp = await getOtpFromDb(SMS_TEST_MOBILE);
  test.skip(!otp, 'No OTP in DB — ensure devMode is false and SMS is enabled');

  await page.goto('/');

  const mobileInput = page.getByPlaceholder(/موبایل|شماره/i).first();
  if (await mobileInput.isVisible().catch(() => false)) {
    await mobileInput.fill(SMS_TEST_MOBILE);
    const requestBtn = page.getByRole('button', { name: /درخواست|ارسال|کد/i }).first();
    if (await requestBtn.isVisible().catch(() => false)) {
      await requestBtn.click();
    }
  }

  const otpInput = page.getByPlaceholder(/کد/i).first();
  await otpInput.fill(otp!, { timeout: 15000 });

  const verifyBtn = page.getByRole('button', { name: /تأیید|ورود/i }).first();
  await verifyBtn.click({ timeout: 15000 });

  await expect(
    page.getByText(/حساب|پروفایل|خروج/i).first()
  ).toBeVisible({ timeout: 30000 });
});
