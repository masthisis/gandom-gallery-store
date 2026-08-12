import { test, expect } from '@playwright/test';

const API = process.env.API_URL || 'http://localhost:1337';
const MOBILE = '09121234567';
const OTP = '11111';

test('storefront mock payment success', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /فروشگاه|محصولات/i }).first().click({ timeout: 15000 }).catch(() => {});
  await page.goto('/product/ceramic-vase-gandom');

  const addBtn = page.getByRole('button', { name: /افزودن|سبد/i }).first();
  await addBtn.click({ timeout: 15000 });

  await page.goto('/checkout');
  await page.getByPlaceholder(/نام/i).first().fill('علی');
  await page.getByPlaceholder(/نام خانوادگی/i).fill('رضایی');
  await page.getByLabel(/استان/i).selectOption({ label: 'تهران' }).catch(() => {});
  await page.getByLabel(/شهر/i).selectOption({ label: 'تهران' }).catch(() => {});
  await page.getByPlaceholder(/آدرس/i).fill('خیابان ولیعصر');
  await page.getByPlaceholder(/پلاک/i).fill('12');
  await page.getByPlaceholder(/واحد/i).fill('3');
  await page.getByPlaceholder(/کد پستی/i).fill('1234567890');
  await page.getByPlaceholder(/موبایل|تلفن/i).fill(MOBILE);

  await page.getByRole('button', { name: /ورود/i }).click({ timeout: 5000 }).catch(() => {});
  await page.getByPlaceholder(/موبایل/i).fill(MOBILE).catch(() => {});
  await page.getByPlaceholder(/کد/i).fill(OTP).catch(() => {});
  await page.getByRole('button', { name: /تأیید|ورود/i }).click({ timeout: 5000 }).catch(() => {});

  await page.getByRole('button', { name: /پرداخت با دیجی‌پی/i }).click({ timeout: 30000 });
  await expect(page.getByText(/پرداخت موفق/i)).toBeVisible({ timeout: 60000 });
});
