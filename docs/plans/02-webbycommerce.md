# Phase 2 — WebbyCommerce + Persian workarounds

## Principle

Plugin = data + flows. Persian UIs = language, formatting, Iran UX.

## Locked workarounds

1. Currency `IRR`; prices as whole Toman; UI `fa-IR` + تومان; Digipay Rial = toman × 10
2. Payment method placeholder `COD`; Digipay state in payment-transaction
3. Latin/ASCII product slugs; Persian text in `name`/`description`
4. Address map: country=IR, region=استان, street=آدرس+پلاک+واحد
5. Tax disabled / 0; Iran shipping zone
6. Status enums mapped to Persian labels in UI
7. No English demo seed — use Persian seed

## Acceptance

- List products → cart → checkout creates plugin order
