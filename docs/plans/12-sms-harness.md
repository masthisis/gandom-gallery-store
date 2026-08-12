# Phase 12 — SMS Admin + Test Harness

## Notifications

All shop alerts use **SMS only** (no email). Configure per-event messages in Strapi admin → **تنظیمات پیامک**.

| Event | Admin SMS | Customer SMS |
|-------|-----------|--------------|
| `auth_otp` | optional | yes (login) |
| `low_stock` | yes | no |
| `order_paid` | yes | yes |
| `payment_failed` | yes | yes |
| `pending_comment` | yes | no |

**Defaults:**
- Line (from): `30002108020007`
- Admin / test mobile: `09366531567`

## Sandbox vs production (SMS.ir)

Per [SMS.ir Sandbox docs](https://app.sms.ir/developer/help/sandbox) and [REST API](https://sms.ir/rest-api/):

| | Sandbox key | Production key |
|---|---|---|
| Dashboard reports | **No** — simulated only | Yes |
| Real SMS to phone | No | Yes |
| Verify template | Fixed `123456` only | Your approved templates |
| Bulk `/v1/send/bulk` | Simulated success if line valid | Real send; line must match your account |

Use `SMSIR_API_KEY` (sandbox) locally; `SMSIR_API_KEY_LIVE` only for `RUN_SMS_LIVE=1` tests.

**Line number:** bulk sends need your dedicated line (default `30002108020007`). Error `101` / «شماره خط نامعتبر» means the stored line is wrong (e.g. `1`) — fix in admin → **تنظیمات پیامک** or set `SMS_LINE_NUMBER` in env.

## Run harness

```bash
docker compose up -d postgres strapi
./scripts/sms-harness.sh
```

Sandbox OTP tests:

```bash
RUN_SMS_SANDBOX=1 ./scripts/sms-harness.sh
```

**Live tests (all event SMS → your SMS.ir dashboard + phone):**

```bash
# backend/.env must include:
# SMSIR_API_KEY_LIVE=your_production_key

RUN_SMS_LIVE=1 SKIP_SMS_E2E=1 ./scripts/sms-harness.sh
```

Sandbox sends do **not** appear in the SMS.ir dashboard. Only production key (`SMSIR_API_KEY_LIVE`) creates real sends visible in the panel.

Skip Playwright E2E if browsers not installed: `SKIP_SMS_E2E=1`

## Admin API

- `POST /gandom-shop/sms-settings/test-event` — `{ event, mobile }`
- `POST /gandom-shop/sms-settings/test-all` — `{ mobile }` sends every event type

## Manual checklist

1. Admin → **تنظیمات پیامک** → set line `30002108020007`, admin mobile `09366531567`
2. Enable SMS, disable OTP dev mode for real login SMS
3. Click **ارسال آزمایشی** per event or **ارسال آزمایشی همه رویدادها**
4. Check SMS.ir panel for sent messages
