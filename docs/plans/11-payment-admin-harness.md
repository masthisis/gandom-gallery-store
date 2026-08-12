# Phase 11 — Payment Admin + E2E Harness

See implementation in:

- `tests/payment-harness/` — Vitest integration + Playwright E2E
- `scripts/payment-harness.sh` — full regression runner
- `backend/src/utils/payment-settings.js` — shared Digipay settings
- `backend/src/plugins/gandom-shop/` — admin payment UI + routes

## Run harness

```bash
docker compose up -d postgres strapi
./scripts/payment-harness.sh
```

## Admin features

- **تنظیمات درگاه** — payment settings, test connection, go-live checklist
- **پرداخت‌ها** — list, filter, detail, refund, manual reconcile
- Dashboard KPIs — failed/pending payments, success rate

## Gate tests

Integration tests in `tests/payment-harness/integration/payment-harness.test.ts` cover P0–P7 behaviors.
