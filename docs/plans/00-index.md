# گندم گالری — Plan Index

## Architecture lock

- **Commerce engine:** `@webbycrown/webbycommerce` (Strapi 5)
- **Do not** build a custom ecommerce plugin or duplicate products/orders tables
- **Adapters only:** Digipay UPG, SMS.ir OTP, homepage/store CMS single-types
- **Language:** Persian storefront + backoffice; Strapi `/admin` stays English
- **Dev OTP:** `11111`

## Phase docs

| File | Phase |
|------|-------|
| [01-foundation.md](01-foundation.md) | Collisions, Tailwind, API clients |
| [02-webbycommerce.md](02-webbycommerce.md) | Plugin config + Persian workarounds |
| [03-auth-sms.md](03-auth-sms.md) | Phone OTP + SMS.ir |
| [04-payment-digipay.md](04-payment-digipay.md) | Digipay UPG |
| [05-homepage-cms.md](05-homepage-cms.md) | Homepage builder |
| [06-storefront-ux.md](06-storefront-ux.md) | Storefront pages |
| [07-backoffice-ux.md](07-backoffice-ux.md) | ~~Persian admin~~ → use Strapi Admin |
| [08-content-policies.md](08-content-policies.md) | Seed, SEO, pages |
| [09-qa-launch.md](09-qa-launch.md) | QA / go-live |
| [10-digikala-parity.md](10-digikala-parity.md) | Digikala storefront + Strapi Admin only |

## Architecture lock (updated)

- **Admin UI:** Strapi `/admin` only (Shop Owner role). Custom `backoffice/` deprecated.
- **Commerce engine:** `@webbycrown/webbycommerce`
- **Homepage:** Strapi dynamic zone section components
- **Language:** Persian storefront; Strapi Admin may stay English
- **Dev OTP:** `11111`