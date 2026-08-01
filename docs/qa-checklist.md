# QA & Launch Checklist — گندم گالری

## Functional

- [ ] Homepage loads sections from `/api/homepage`
- [ ] Shop / category / search list products from WebbyCommerce
- [ ] Product detail + add to cart + favorites
- [ ] OTP request + verify with `11111` in dev
- [ ] Checkout address (استان/شهر validated) → Digipay mock → paid → profile/address saved
- [ ] Account: orders, addresses CRUD, favorites
- [ ] CMS pages (about, shipping, …)
- [ ] Comments require admin approve before public show; replies work

## Strapi Admin (Shop Owner)

- [ ] Login as `owner@gandom.local` / `SHOP_OWNER_PASSWORD`
- [ ] Interface language فارسی
- [ ] داشبورد فروشگاه shows income / low-stock / recent orders
- [ ] دیدگاه‌های در انتظار: approve/reject
- [ ] مشتریان: see orders
- [ ] CRUD محصولات، سفارش‌ها (status update)، پرداخت‌ها
- [ ] دسته‌بندی‌ها tree + commerceSlug syncs WC category
- [ ] صفحه اصلی dynamic zone edit
- [ ] تنظیمات فروشگاه: `lowStockThreshold`

## Security

- [ ] Public role cannot write payment/sms secrets without auth
- [ ] Synthetic emails not shown in storefront
- [ ] No English Stripe/USD strings in customer UI
- [ ] OTP `11111` / `devHint` disabled in production
- [ ] Digipay ticket requires login; refund requires secret
- [ ] Super Admin + Shop Owner both login; passwords only in env
- [ ] Liara admin email notifications configured (اعلان‌های ایمیل + MAIL_*)
- [ ] See [docs/security-checklist.md](security-checklist.md)

## Ops

- [ ] `docker compose up` boots postgres + strapi + frontend
- [ ] `GANDOM_SEED=true` seeds Persian catalog once
- [ ] Postgres volume backup documented

## Backup note

```bash
docker exec gandom_postgres_dev pg_dump -U strapi strapi > backup-$(date +%F).sql
```
