# Phase 3 — Auth + SMS.ir

## Flow

1. `POST /api/auth-otp/request` with mobile
2. Dev mode: store OTP `11111`, skip SMS
3. Prod: SMS.ir `/v1/send/verify`
4. `POST /api/auth-otp/verify` → JWT
5. Synthetic email `09…@users.gandom.local` if email required
6. Hide `webby*` usernames in UI

## Settings (sms-setting)

- apiKey, templateId, lineNumber, devMode, enabled

## Acceptance

- Login with phone + `11111` in docker/dev
