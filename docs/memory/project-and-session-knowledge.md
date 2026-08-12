# Project & Session Knowledge — گندم گالری

> Persistent agent memory for graphify. Captures architecture, locked decisions, implemented features, security posture, and conversation outcomes (Aug 2026). **Never store plaintext passwords here** — only env var names.

## Project identity

- **Name:** گندم گالری (Gandom Gallery Shop) — full-featured **Persian ecommerce** store (DigiKala-style), not a simple gallery.
- **Repo:** `gandom_galery_shop`
- **Customer language:** Persian only (fa, RTL).
- **Admin:** Strapi `/admin` only; `backoffice/` is **deprecated** — do not revive.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Strapi 5.51, TypeScript, PostgreSQL (Docker) |
| Commerce | `@webbycrown/webbycommerce` — **do not** rebuild products/orders in custom APIs |
| Frontend | Vite + React + TypeScript + Tailwind, Persian RTL |
| Payments | Digipay UPG adapter (`backend/src/api/digipay/`) |
| OTP/SMS | SMS.ir adapter; dev OTP `11111` (non-production only) |
| Email | Liara SMTP via `nodemailer` (`backend/src/utils/mailer.ts`) |
| Admin plugin | `gandom-shop` — dashboard, comment queue, customers |
| Memory | graphify (`graphify-out/`, ~999 nodes) + Headroom proxy |

## Locked decisions (never override without explicit user request)

1. WebbyCommerce owns catalog, cart, orders — remove colliding custom `products`/`orders` collections.
2. Shop Owner uses Strapi Admin (Persian); Super Admin (developer) may use English.
3. Homepage = Strapi **dynamic zone** of section components (not raw JSON for owners).
4. Two bootstrap admins from env: `SUPER_ADMIN_*` + `SHOP_OWNER_*` — passwords only in `.env`.
5. Plans live under `docs/plans/` — do not edit plan files unless user asks.
6. Thin adapters for Digipay + SMS.ir; settings via Strapi content-types.
7. Dev OTP `11111` blocked in production unless `ALLOW_DEV_OTP_IN_PRODUCTION=true`.

## Admin roles

| Role | Env | Access |
|------|-----|--------|
| Super Admin (developer) | `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_FIRSTNAME`, `SUPER_ADMIN_LASTNAME`, `SUPER_ADMIN_FORCE_PASSWORD` | Full Strapi |
| Shop Owner (مالک فروشگاه) | `SHOP_OWNER_EMAIL`, `SHOP_OWNER_PASSWORD`, `SHOP_OWNER_FIRSTNAME`, `SHOP_OWNER_LASTNAME`, `SHOP_OWNER_FORCE_PASSWORD` | Products, categories, orders, coupons, reviews, homepage, settings, comments, favorites, dashboard |

Bootstrap order in `backend/src/index.ts`: `ensureShopOwnerRole` → `ensureSuperAdminUser` → `ensureShopOwnerUser`.

Key files: `backend/src/utils/shop-owner-role.ts`, `backend/src/utils/super-admin-user.ts`.

## Storefront features (implemented)

### Iran geography & validation

- `backend/src/data/iran-geo.json` — 31 provinces, 448 cities (seed in production).
- `backend/src/utils/iran-validation.ts` — mobile, postal code, Persian names, province/city match, full address.
- API: `GET /api/iran-geo`, `GET /api/iran-geo/province/:name`.
- Frontend: `frontend/src/lib/iranValidation.ts`, `frontend/src/components/AddressFields.tsx`.

### Comments & moderation

- Collection: `store-comment` — `productSlug`, `body`, `rating`, `is_visible` (default false), `user`, `parent`, `replies`.
- New comments/replies hidden until admin approves.
- Plugin page: `gandom-shop` → دیدگاه‌های در انتظار.
- Logged-in users can comment; threaded replies via `parentId`.

### Profile & checkout persistence

- `backend/src/api/profile/` — `/api/profile/me`, addresses CRUD, `save-from-checkout`.
- After first payment, name/phone/address saved for future checkout and account page.

### Favorites

- `backend/src/api/favorite/` — list, status, add, toggle, remove.
- UI: `ProductPage.tsx` heart, `AccountPage.tsx` favorites list.

### Product page

- Category breadcrumbs via `nav-category` tree + `Breadcrumbs.tsx`.
- Comments with replies; favorites; WebbyCommerce product data + `productMeta` specs.

### Categories

- `nav-category` — Persian display name, parent/children, `commerceSlug`.
- Lifecycle syncs to WebbyCommerce product category on create/update.

## Shop Owner admin (gandom-shop plugin)

Registered in `backend/config/plugins.ts`. Persian labels in `backend/src/admin/extensions/translations/fa.json`.

### Dashboard metrics (`server/src/services/dashboard.js`)

- Income (toman), order counts, paid orders, sold units (approximate — WebbyCommerce items lack quantity), low-stock products, pending comments, recent orders, customers.

### Routes (admin JWT)

- `GET /gandom-shop/overview`
- `GET /gandom-shop/pending-comments` + approve/reject
- `GET /gandom-shop/customers`
- `POST /gandom-shop/test-email`

### Content Manager (Persian)

Products, orders, payments, categories, homepage, store settings, notification settings, pages, comments, favorites.

Low-stock threshold: **تنظیمات فروشگاه → lowStockThreshold** (default 5). Alert when `stock_quantity < threshold`.

## Email notifications (Liara SMTP)

- Settings single-type: `notification-setting` — `enabled`, `adminEmail`, toggles for `low_stock`, `payment_failed`, `order_paid`, `pending_comment`, `extraEventToggles`.
- Dispatcher: `notifyAdmin(strapi, event, payload)` in `notify-admin.ts`.
- Hooks: `notification-hooks.ts` — low-stock (6h cooldown), pending comments.
- Digipay callbacks fire `order_paid` / `payment_failed`.
- Env: `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`.
- Liara docs: https://docs.liara.ir/email-server/about/

## Security hardening (audit complete)

See `docs/security-checklist.md`. Highlights:

- OTP `11111` disabled in production; no OTP in API response body in prod.
- Digipay ticket requires authenticated user; refund requires `DIGIPAY_REFUND_SECRET` / `x-refund-secret`.
- Public Digipay permission removed on bootstrap.
- Mock payment callbacks rejected in production when real gateway active.
- Comments moderated by default.
- Profile/favorites/addresses require Bearer JWT.
- Secrets in `.env` only; rotate any exposed Liara JWT in workspace `liara` file.

## Commands & ops

```bash
docker compose up --build          # full stack
npm run dev                        # frontend only (frontend/)
docker restart gandom_strapi_dev   # after admin/plugin changes
graphify query "<question>"        # codebase memory
graphify update .                  # refresh code graph (AST, free)
./scripts/gandom-liara.sh          # Liara ops
./scripts/verify-memory-setup.sh   # graphify + headroom health
```

Production: `docs/liara-production.md`, `docker-compose.prod.yml`, `GANDOM_SEED=false` after initial data.

## Conversation arc (what the user asked for)

1. Full store completion plan — phased docs under `docs/plans/`.
2. Use WebbyCommerce plugin, not custom ecommerce.
3. Persian workarounds for WebbyCommerce limitations.
4. Fix broken frontend/backoffice UI → pivoted to **Strapi Admin only**.
5. Digikala-style storefront + Strapi admin for shop owner.
6. Seed products, users, comments, specs, images.
7. Iran provinces/cities, address/phone validation, moderated threaded comments, checkout profile save, favorites, PDP breadcrumbs.
8. Shop Owner admin: full CRUD, dashboard, low-stock, comment queue, customers, Persian labels.
9. Two production admins (Super Admin developer + restricted Shop Owner).
10. Security audit + checklist.
11. Liara admin email for low stock, failed payments, extensible events.
12. **Persist project + chat into graphify memory** (this document).

## Production checklist (pending ops)

- [ ] Fill real Liara `MAIL_*` credentials; enable **اعلان‌های ایمیل** in Strapi; set `adminEmail`.
- [ ] Disable Digipay mock mode and SMS dev mode.
- [ ] Rotate production secrets (`APP_KEYS`, JWT secrets, DB password).
- [ ] HTTPS + rate-limit OTP at reverse proxy.
- [ ] Scheduled Postgres backups.
- [ ] `GANDOM_SEED=false` after seeding.

## Known limitations

- Sold units on dashboard are approximate (WebbyCommerce order line items don't expose quantities reliably).
- Graphify AST update skips some JSON/schema files (zero-node warnings).
- Headroom proxy works for Codex/Claude CLI; Cursor BYOK localhost blocked — use graphify for codebase memory in Cursor.
- Graphiti MCP was requested as "graffity" but is not configured; **graphify is the project's knowledge graph**.

## Key file index

| Area | Path |
|------|------|
| Bootstrap | `backend/src/index.ts` |
| Shop owner role | `backend/src/utils/shop-owner-role.ts` |
| Super admin | `backend/src/utils/super-admin-user.ts` |
| Iran validation | `backend/src/utils/iran-validation.ts` |
| Mailer | `backend/src/utils/mailer.ts` |
| Notifications | `backend/src/utils/notify-admin.ts`, `notification-hooks.ts` |
| Digipay | `backend/src/api/digipay/controllers/digipay.ts` |
| Profile API | `backend/src/api/profile/` |
| Favorites | `backend/src/api/favorite/` |
| Comments | `backend/src/api/store-comment/`, `product-comment/` |
| Admin plugin | `backend/src/plugins/gandom-shop/` |
| Persian admin | `backend/src/admin/app.tsx`, `extensions/translations/fa.json` |
| Agent rules | `AGENTS.md`, `.cursor/rules/graphify.mdc` |
| QA | `docs/qa-checklist.md` |
| Security | `docs/security-checklist.md` |
