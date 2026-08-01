# گندم گالری

Full-featured DigiKala-style Persian shop on Strapi 5 + WebbyCommerce.

## Stack

- `backend/` — Strapi 5, WebbyCommerce, Digipay + SMS.ir adapters, homepage CMS (dynamic zones), `gandom-shop` admin plugin
- `frontend/` — Vite/React storefront (fa/RTL, Digikala-like UX)
- `backoffice/` — **deprecated**; shop owners use Strapi Admin instead

## Quick start

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- **Store:** http://localhost:5173  
- **Admin (shop owner):** http://localhost:1337/admin  

Dev OTP: `11111`  

Plans: [docs/plans/00-index.md](docs/plans/00-index.md)  
Production (Liara): [docs/liara-production.md](docs/liara-production.md)

## Shop owner admin

Two production admin accounts (bootstrapped from env):

| Role | Env vars | Access |
|------|----------|--------|
| **Super Admin** (developer) | `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Full Strapi |
| **Shop Owner** | `SHOP_OWNER_EMAIL` / `SHOP_OWNER_PASSWORD` | Catalog, orders, dashboard, comments |

Secrets belong in `backend/.env` (never commit). Use `SUPER_ADMIN_FORCE_PASSWORD=true` once to reset, then set `false`.

### Menu (plugin فروشگاه گندم)

- **داشبورد فروشگاه** — درآمد، سفارش‌ها، موجودی کم، لینک ویرایش صفحه اصلی
- **دیدگاه‌های در انتظار** — تأیید / رد نظرات قبل از نمایش در سایت
- **مشتریان** — لیست مشتریان و سفارش‌هایشان

### Content Manager (Persian labels)

- محصولات، سفارش‌ها، پرداخت‌ها، دسته‌بندی‌ها (درخت + همگام‌سازی با دسته محصول)، صفحه اصلی، تنظیمات فروشگاه
- آستانه موجودی کم: **تنظیمات فروشگاه → lowStockThreshold** (پیش‌فرض ۵)
- وضعیت سفارش: `pending` → `processing` → `shipped` → `delivered`

Security: [docs/security-checklist.md](docs/security-checklist.md)

## Admin email notifications (Liara)

Uses [Liara Email Server SMTP](https://docs.liara.ir/email-server/how-tos/connect-via-platform/nodejs/) via `nodemailer`.

1. In Liara: add sender address + SMTP user ([docs](https://docs.liara.ir/email-server/about/))
2. Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM` in `backend/.env`
3. In Strapi Admin → **اعلان‌های ایمیل**: enable, set `adminEmail`, toggle events (low stock, payment failed, …)
4. Optional: `POST /gandom-shop/test-email` (logged-in admin) to verify SMTP
