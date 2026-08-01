# Digikala parity — Storefront + Strapi Admin

## Admin

- URL: `/admin`
- Role: **Shop Owner** (bootstrapped) — Content Manager + Media for WC catalog, homepage, pages, settings
- Custom React `backoffice/` is deprecated

## Homepage

Dynamic zone components under `sections.*` (hero-slider, product-slider, mixed-slider, incredible-offers, banner-grid, story-row, category-grid, trust-badges, product-row, image-slider).

Public: `GET /api/homepage` serializes to storefront section DTOs.

## Categories

- **Menu Category (Tree)** (`nav-category`): nested mega-menu tree in Strapi Admin (`parent`, `menu_order`, `commerceSlug`)
- WebbyCommerce **Product Category**: assign products (flat); match via `commerceSlug`
- Public: `GET /api/category-tree` (nested from nav-categories)

## Storefront

Digikala-like RTL UI in `frontend/` — mega-menu, SectionRenderer, PLP, PDP, cart, account.
