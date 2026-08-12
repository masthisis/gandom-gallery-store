#!/usr/bin/env node
/**
 * Persian demo seed data lives in:
 *   src/utils/seed-persian.ts
 *   src/utils/seed-upload.ts
 *   src/seed-assets/
 *
 * Run via Strapi bootstrap:
 *   GANDOM_SEED=true GANDOM_SEED_FORCE=true GANDOM_BULK_SEED=true npm run develop
 *
 * Bulk local demo (default in docker-compose):
 *   200 products, 20 categories × 50 subcategories, 100 customers
 *
 * After first successful seed in production, set GANDOM_SEED=false.
 */
console.log(`
Gandom Persian demo seed
========================
1. Ensure PostgreSQL is up and backend/.env has database credentials.
2. Set:
     GANDOM_SEED=true
     GANDOM_SEED_FORCE=true   # refresh homepage presentation
3. Start Strapi:
     npm run develop
4. Wait for log: "[gandom] Persian demo seed complete"
5. Open storefront + /admin

Demo customers: 09121111111 … 09125555555  password: Gandom123!
OTP (dev): 11111
`);
