# Phase 1 — Foundation

## Goals

- Remove custom `api::product`, `api::order`, `api::category`
- Keep WebbyCommerce enabled
- Extend users with `phone_no`, `first_name`, `last_name`
- Add CMS single-types: homepage, store-setting, payment-setting, sms-setting, page
- Wire Tailwind + design tokens in frontend/backoffice
- Shared axios clients for `/api/webbycommerce/*`

## Acceptance

- Strapi boots without table collisions
- FE/BO build with compiled Tailwind utilities
- Typed API client stubs present
