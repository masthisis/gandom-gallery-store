# AGENTS.md — گندم گالری

## Locked decisions

1. Use `@webbycrown/webbycommerce` — do not rebuild ecommerce in custom APIs.
2. Remove any custom `products`/`orders` collection that collides with the plugin.
3. Persian-only customer storefront; **Shop Owner Strapi Admin is Persian**. Super Admin (developer) may use English.
4. Digipay UPG + SMS.ir via thin adapters; configure via Strapi content-types (store/SMS/payment settings).
5. Dev OTP code: `11111` (non-production only).
6. **Admin UI = Strapi `/admin` only** — plugin `gandom-shop` for dashboard / comments / customers.
7. Homepage is a Strapi **dynamic zone** of section components (not raw JSON for owners).
8. Plans live under `docs/plans/`.
9. Two admins: Super Admin (`SUPER_ADMIN_*`) + Shop Owner (`SHOP_OWNER_*`) from env — never commit passwords.
## Commands

- Stack: `docker compose up --build` from repo root
- Frontend (local): `npm run dev` in `frontend/`
- Backend: Strapi in Docker (`gandom_strapi_dev`) — use compose, not Sail unless in a Sail project
- After `src/admin` or plugin admin changes: restart Strapi so admin rebuilds (`docker restart gandom_strapi_dev`)
