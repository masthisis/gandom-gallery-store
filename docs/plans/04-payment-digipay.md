# Phase 4 — Digipay UPG

## Flow

1. Checkout creates WebbyCommerce order (`payment_method=COD` placeholder)
2. `POST /api/digipay/ticket` → OAuth + tickets/business
3. Redirect to Digipay
4. Callback → confirm → order `payment_status=paid`

## Settings (payment-setting)

- clientId, clientSecret, username, password, baseUrl (UAT/prod), callbackUrl, enabled

## Acceptance

- Ticket → callback → paid order (or mock confirm when Digipay disabled / mock mode)
