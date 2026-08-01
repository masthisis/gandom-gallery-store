# Security checklist — گندم گالری (vibe-coded app hardening)

## Auth & sessions

- [x] Storefront OTP: Iranian mobile validation
- [x] Production: fixed OTP `11111` disabled unless `ALLOW_DEV_OTP_IN_PRODUCTION=true`
- [x] OTP code never returned in API body when `NODE_ENV=production`
- [x] Synthetic `@users.gandom.local` emails hidden in storefront verify response
- [x] Profile / favorites / addresses require Bearer JWT (`resolveUser`)
- [x] Digipay ticket creation requires logged-in user
- [x] Digipay refund requires `x-refund-secret` / `DIGIPAY_REFUND_SECRET`
- [x] Digipay permission removed from Public role on bootstrap
- [x] Mock payment callback rejected in production when real gateway enabled

## Admin accounts (two roles)

| Role | Purpose | Env |
|------|---------|-----|
| Super Admin | Full Strapi (developer) | `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` |
| Shop Owner | Catalog, orders, dashboard, comments | `SHOP_OWNER_EMAIL` / `SHOP_OWNER_PASSWORD` |

- [x] Bootstrapped on Strapi start when env set
- [x] Passwords live only in `.env` (gitignored) — not in source
- [x] `SUPER_ADMIN_FORCE_PASSWORD=true` once to reset, then turn off

## Secrets & config

- [x] Root `.gitignore` covers `.env`, `liara`, keys
- [x] `backend/.env` gitignored
- [ ] Rotate any token previously stored in workspace `liara` file if it was a real Liara JWT
- [ ] Production `APP_KEYS`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, DB password are unique & strong
- [ ] SMS.ir / Digipay credentials only in CMS settings or env — not in frontend

## Data / payments

- [x] Comments moderated (`is_visible` default false)
- [x] Address & phone validation (IR rules)
- [x] Payment amounts validated before ticket
- [ ] Rate-limit OTP endpoints at reverse proxy (Liara/nginx) — recommended
- [ ] Enable HTTPS only in production
- [ ] Turn off Digipay `mockMode` and SMS `devMode` before go-live

## Admin surface

- [x] Shop Owner cannot manage roles / API tokens (Super Admin only)
- [x] gandom-shop dashboard routes use `admin::isAuthenticatedAdmin`
- [x] Persian labels for shop-owner CM types

## Ops

- [ ] Postgres backups scheduled
- [ ] `GANDOM_SEED=false` on production after initial data
- [ ] Monitor Strapi logs for OTP/payment errors
