import { test, expect } from '@playwright/test';

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:1337/admin';
const SHOP_OWNER_EMAIL = process.env.SHOP_OWNER_EMAIL || 'owner@gandom.local';
const SHOP_OWNER_PASSWORD = process.env.SHOP_OWNER_PASSWORD || 'GandomOwner123!';
const SMS_TEST_MOBILE = process.env.SMS_TEST_MOBILE || '09366531567';

test('admin SMS settings page loads and test-connection works', async ({ page }) => {
  await page.goto(`${ADMIN_URL}/auth/login`);
  await page.getByLabel(/email|ایمیل/i).fill(SHOP_OWNER_EMAIL);
  await page.getByLabel(/password|رمز/i).fill(SHOP_OWNER_PASSWORD);
  await page.getByRole('button', { name: /login|ورود/i }).click();

  await page.waitForURL(/\/admin/, { timeout: 30000 });

  await page.goto(`${ADMIN_URL}/plugins/gandom-shop/sms-settings`);
  await expect(page.getByRole('heading', { name: /تنظیمات پیامک/i })).toBeVisible({
    timeout: 30000,
  });

  const mobileInput = page.locator('input[name="testMobile"]');
  await mobileInput.fill(SMS_TEST_MOBILE);

  await page.getByTestId('sms-test-connection').click();

  const result = page.getByTestId('sms-test-result');
  await expect(result).toBeVisible({ timeout: 60000 });
  await expect(result).toContainText(/موفق|successful|status/i);
});
