import { test, expect } from '@playwright/test';

const MOBILE = '09121234567';
const OTP = '11111';

test('storefront dev OTP login', async ({ page }) => {
  await page.goto('/');

  const loginLink = page.getByRole('link', { name: /ورود|حساب/i }).first();
  if (await loginLink.isVisible().catch(() => false)) {
    await loginLink.click();
  } else {
    await page.goto('/login').catch(() => page.goto('/'));
  }

  const mobileInput = page.getByPlaceholder(/موبایل|شماره/i).first();
  await mobileInput.fill(MOBILE, { timeout: 15000 });

  const requestBtn = page.getByRole('button', { name: /درخواست|ارسال|کد/i }).first();
  if (await requestBtn.isVisible().catch(() => false)) {
    await requestBtn.click();
  }

  const otpInput = page.getByPlaceholder(/کد/i).first();
  await otpInput.fill(OTP, { timeout: 15000 });

  const verifyBtn = page.getByRole('button', { name: /تأیید|ورود/i }).first();
  await verifyBtn.click({ timeout: 15000 });

  await expect(
    page.getByText(/حساب|پروفایل|خروج|علی/i).first()
  ).toBeVisible({ timeout: 30000 });
});
