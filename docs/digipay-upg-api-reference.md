# Digipay UPG API Reference

Source: [Digipay UPG developer docs](https://www.mydigipay.com/developers/docs/upg/#1)

This file is a cleaned project reference for integrating Digipay UPG in `گندم گالری`. It is intended to be used by Cursor, agents, and developers for implementation, deployment, and testing.

It complements the project integration plan in [docs/plans/04-payment-digipay.md](./plans/04-payment-digipay.md), where the intended local flow is:

1. Checkout creates a WebbyCommerce order.
2. Backend calls Digipay to get a ticket.
3. Customer is redirected to Digipay.
4. Digipay returns payment result to our callback.
5. Backend verifies payment and marks the order paid.

## Quick Reference

| Purpose | Method | Path | Notes |
| --- | --- | --- | --- |
| OAuth token | `POST` | `/oauth/token` | Form-data body, Basic auth header |
| Create purchase ticket | `POST` | `/tickets/business?type=11` | Returns `ticket` and `redirectUrl` |
| Payment result callback | `POST` | Merchant callback URL | Sent by Digipay to us |
| Verify payment | `POST` | `/purchases/verify?type={type}` | Required after successful payment |
| Manual reverse | `POST` | `/reverse?type={type}` | Short time window after verify; IPG/DPG only per docs |
| Deliver purchase | `POST` | `/purchases/deliver?type={type}` | Only for credit/BNPL flows |
| Refund | `POST` | `/refunds?type={type}` | Uses a new refund `providerId` |
| Refund inquiry | `POST` | `/refunds/{InquiryId}?type={type}` | Inquiry by refund tracking or provider ID |

## Environments

| Environment | Base URL |
| --- | --- |
| UAT / staging | `https://uat.mydigipay.info/digipay/api` |
| Production / live | `https://api.mydigipay.com/digipay/api` |

Recommended local config fields for the project:

- `clientId`
- `clientSecret`
- `username`
- `password`
- `baseUrl`
- `callbackUrl`
- `enabled`
- `mockMode`

These match the project plan in [docs/plans/04-payment-digipay.md](./plans/04-payment-digipay.md).

## UPG Payment Modes

Digipay UPG is a unified payment entry point that can route the customer into multiple payment tools:

- `BPG`: credit / BNPL purchase capability
- `CPG`: installment wallet capability
- `Wallet`: Digipay cash wallet
- `IPG`: internet payment gateway

In practice for this project, the most important behaviors are:

- Direct online payment through `IPG`
- Wallet payment through `Wallet`
- Possible future credit / BNPL flows

## Authentication

Before calling any business API, obtain an access token.

### Auth Endpoint

- `POST /oauth/token`

### Authentication model

The request uses:

- `Authorization: Basic <base64(client_id:client_secret)>`
- `multipart/form-data` body

### Auth Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | string | Yes | Merchant username from Digipay |
| `password` | string | Yes | Merchant password from Digipay |
| `grant_type` | string | Yes | Always `password` |

### Auth Example

```bash
curl --location --request POST 'https://uat.mydigipay.info/digipay/api/oauth/token' \
  --header 'Authorization: Basic BASE64_CLIENT_ID_COLON_CLIENT_SECRET' \
  --form 'username=sampleUsername' \
  --form 'password=samplePassword' \
  --form 'grant_type=password'
```

### Success response

| Field | Type | Description |
| --- | --- | --- |
| `access_token` | string | Bearer token for API calls |
| `refresh_token` | string | Token refresh value |
| `token_type` | string | Usually `bearer` |
| `expires_in` | integer | Access token TTL in seconds |
| `scope` | string | Scope string from Digipay |
| `jti` | string | Token identifier |

### Example response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6Ikxxx",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6xxxx",
  "expires_in": 3599,
  "scope": "USER WALLET_BUSINESS_INTEGRATION BUSINESS_API test Permission_Test",
  "jti": "RkuR_-p7mSP4VJzYrxZpRvGI5ww"
}
```

### Integration notes

- All later API calls use `Authorization: Bearer <access_token>`.
- If a token expires or is invalid, Digipay returns `401`.
- The source docs mention `refresh_token` but the provided scraped section does not include a dedicated refresh endpoint example, so the project should start with fresh login/token acquisition unless Digipay provides separate refresh instructions during onboarding.

## Shared Business Request Headers

Most JSON API endpoints use these headers:

| Header | Value |
| --- | --- |
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `application/json; charset=UTF-8` |
| `Agent` | `WEB` |
| `Digipay-Version` | `2022-02-02` |

Notes:

- The docs explicitly require `Agent` and `Digipay-Version` for ticket creation.
- Later sections only repeat `Authorization` and `Content-Type`, but keeping the same client header style across the adapter is safer unless Digipay says otherwise.

## 1. Create Purchase Ticket

This is the main checkout initiation step.

### Ticket Endpoint

- `POST /tickets/business?type=11`

`type=11` is documented as the UPG ticket type used for all UPG features.

### Ticket Request Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | long | Yes | Purchase amount |
| `cellNumber` | string | Yes | Customer mobile number |
| `providerId` | string | Yes | Merchant-side unique purchase ID |
| `callbackUrl` | string | Yes | Customer return / merchant callback URL |
| `basketDetailsDto` | object | Conditional | Required for credit / installment related flows |
| `splitDetailsList` | list | Conditional | Required for split or insurance scenarios |
| `additionalInfo` | map | No | Additional options such as preferred gateway |

### Basket details

`basketDetailsDto`:

| Field | Type | Description |
| --- | --- | --- |
| `basketId` | string | Unique basket ID |
| `items` | array | Basket items |

Each item:

| Field | Type | Description |
| --- | --- | --- |
| `sellerId` | string | Seller identifier |
| `supplierId` | string | Supplier identifier |
| `productCode` | string | Product code |
| `brand` | string | Brand identifier or name |
| `productType` | integer | Product type code |
| `count` | integer | Quantity |
| `categoryId` | string | Category identifier |

`productType` codes:

| Code | Meaning |
| --- | --- |
| `1` | Durable |
| `2` | Consumable |
| `3` | Service |
| `4` | Durable consumable |

Documented example category values:

- `Mobile`
- `laptop`
- `tablet`
- `gameconsole`

### Split details

`splitDetailsList` supports split payment scenarios such as insurance or bundled extra services.

Split object:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | Yes | `simple` or `insurance` |
| `username` | string | Yes | Destination username |
| `amount` | long | Yes | Split amount |
| `policies` | array | Conditional | Required for insurance split |
| `policyHolder` | object | Conditional | Required for insurance split |

Split `type` values:

| Value | Meaning |
| --- | --- |
| `simple` | Basic split |
| `insurance` | Insurance split |

Insurance policy item:

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | No |
| `variantId` | string | Yes |
| `category` | string | Yes |
| `brand` | string | Yes |
| `model` | string | Yes |
| `serialNo` | string | No |
| `price` | long | Yes |
| `priceWithDiscount` | long | No |

`policyHolder`:

| Field | Type | Required |
| --- | --- | --- |
| `nationalCode` | string | No |
| `firstName` | string | Yes |
| `lastName` | string | Yes |
| `cellNumber` | string | Yes |
| `digiPlusCustomer` | boolean | No |
| `postCode` | string | No |
| `address` | string | Yes |

### Preferred gateway

`additionalInfo.preferredGateway` lets the merchant skip the Digipay payment method chooser and redirect directly to a payment rail.

| Value | Meaning |
| --- | --- |
| `0` | Wallet |
| `2` | IPG |

### Standard ticket example

```bash
curl --location 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11' \
  --header 'Agent: WEB' \
  --header 'Digipay-Version: 2022-02-02' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --data '{
    "cellNumber": "09303030875",
    "amount": 10000,
    "providerId": "32111",
    "callbackUrl": "https://example.com/payment/digipay/callback"
  }'
```

### Direct IPG example

```bash
curl --location 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11' \
  --header 'Agent: WEB' \
  --header 'Digipay-Version: 2022-02-02' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --data '{
    "cellNumber": "09335292905",
    "amount": 10000,
    "providerId": "811165310",
    "callbackUrl": "https://example.com/payment/digipay/callback",
    "additionalInfo": {
      "preferredGateway": 2
    }
  }'
```

### Direct Wallet example

```bash
curl --location 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11' \
  --header 'Agent: WEB' \
  --header 'Digipay-Version: 2022-02-02' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --data '{
    "cellNumber": "09335292905",
    "amount": 10000,
    "providerId": "811165310",
    "callbackUrl": "https://example.com/payment/digipay/callback",
    "additionalInfo": {
      "preferredGateway": 0
    }
  }'
```

### Ticket response

| Field | Type | Description |
| --- | --- | --- |
| `redirectUrl` | string | Customer redirect URL to Digipay payment flow |
| `ticket` | string | Digipay ticket ID |
| `result.status` | integer | Status code |
| `result.message` | string | Human-readable message |
| `result.level` | string | Severity level |
| `insurancePolicies` | object | Present for insurance split flows |

### Ticket response example

```json
{
  "result": {
    "title": "SUCCESS",
    "status": 0,
    "message": "عملیات با موفقیت انجام شد",
    "level": "INFO"
  },
  "ticket": "v2:ab17ec383d654be3b009f9fc45202f80",
  "redirectUrl": "https://uatweb.mydigipay.info/web-pay/tgs/v2:ab17ec383d654be3b009f9fc45202f80"
}
```

### Project integration notes

- `providerId` must be unique and must map back to the order in our system.
- Persist the returned `ticket` and `redirectUrl`.
- Persist the chosen base environment so callback verification uses the same environment.
- `callbackUrl` should point to a backend endpoint that can safely validate and verify the payment before changing order state.

## 2. Payment Result Callback

After the customer attempts payment, Digipay sends a `POST` request to the merchant callback URL.

### Callback payload

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | long | Yes | Purchase amount |
| `providerId` | string | Yes | Merchant purchase ID |
| `trackingCode` | string | Yes | Digipay tracking code |
| `rrn` | string | No | IPG RRN |
| `psp` | object | No | PSP identifier for IPG |
| `isCredit` | boolean | No | Whether payment was credit-based |
| `result` | string | Yes | `SUCCESS` or `FAILURE` |
| `type` | integer | Yes | Payment type code |

### Callback `type` codes

| Code | Meaning |
| --- | --- |
| `0` | IPG |
| `11` | WALLET |
| `5` | CREDIT |
| `13` | BNPL |
| `24` | CREDIT-CARD |

### Important verification rule

Before verifying a successful transaction, compare:

- callback `amount`
- callback `providerId`

against the order or payment record in our own database.

Do not trust the callback alone to mark an order as paid.

## 3. Verify Payment

If payment result is successful, call the verify endpoint. The docs warn that if the purchase is not verified, Digipay may automatically cancel it and return the amount after a limited time.

### Verify Endpoint

- `POST /purchases/verify?type={type}`

### Verify Request Body

| Field | Type | Required |
| --- | --- | --- |
| `trackingCode` | string | Yes |
| `providerId` | string | Yes |

### Verify example

```bash
curl --location --request POST 'https://uat.mydigipay.info/digipay/api/purchases/verify?type=5' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "trackingCode": "10357963991735727353649",
    "providerId": "9345622059488682121"
  }'
```

### Verify response

| Field | Type | Description |
| --- | --- | --- |
| `trackingCode` | string | Purchase tracking code |
| `providerId` | string | Merchant purchase ID |
| `terminalId` | string | IPG only |
| `rrn` | string | IPG only |
| `maskedPan` | string | Masked customer card |
| `pspCode` | string | IPG PSP code |
| `pspName` | string | IPG PSP name |
| `fpCode` | string | Financing provider code |
| `fpName` | string | Financing provider name |
| `amount` | string | Purchase amount |
| `paymentGateway` | enum | Gateway type |
| `additionalInfo` | object | More credit/payment details |
| `result.status` | integer | Result status |
| `result.message` | string | Result message |
| `result.level` | string | Result level |

`paymentGateway` values:

| Code | Meaning |
| --- | --- |
| `0` | IPG |
| `3` | WALLET |
| `4` | CPG / credit |

`additionalInfo` fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `prepaymentAmount` | long | Prepayment plus fee charge |
| `cashAmount` | long | Cash amount |
| `creditAmount` | long | Credit amount |
| `instantFinalization` | boolean | Whether contract was finalized instantly |
| `generateInvoice` | boolean | Whether invoice generation occurred |

### Verify response example

```json
{
  "result": {
    "status": 0,
    "message": "عملیات با موفقیت انجام شد",
    "level": "INFO"
  },
  "trackingCode": "19259313601650191846745",
  "providerId": "132713002000200010",
  "fpCode": "7",
  "fpName": "DIGIPAY",
  "amount": 200000,
  "paymentGateway": 4,
  "additionalInfo": {
    "prepaymentAmount": 0,
    "cashAmount": 0,
    "creditAmount": 200000,
    "instantFinalization": false,
    "generateInvoice": false
  }
}
```

### Verify Integration Notes

- Only mark the order paid after verify succeeds.
- Store Digipay references such as `trackingCode`, `rrn`, `pspCode`, `pspName`, and `maskedPan` if returned.
- Keep the raw callback and verify response for audit/debug purposes.

## 4. Manual Reverse

This is for quickly undoing a verified purchase within a short time window.

### Reverse Endpoint

- `POST /reverse?type={type}`

### Constraints from the docs

- Intended for purchases that were already verified.
- Intended when the merchant wants to reverse within less than 25 minutes.
- Docs say this is only available for IPG and DPG features.
- Docs also state that for one purchase, only one of `refund` or `manual reverse` should be called.

### Reverse Request Body

| Field | Type | Required |
| --- | --- | --- |
| `trackingCode` | string | Yes |
| `providerId` | string | Yes |

### Reverse Example

```bash
curl --location --request POST 'https://uat.mydigipay.info/digipay/api/reverse' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "trackingCode": "571000000098",
    "providerId": "PURCHASE_PROVIDER_ID"
  }'
```

### Response fields

| Field | Type | Description |
| --- | --- | --- |
| `providerId` | string | Merchant purchase ID |
| `trackingCode` | string | Purchase tracking code |
| `rrn` | string | IPG RRN |
| `maskedPan` | string | Masked card |
| `amount` | string | Amount |
| `paymentGateway` | enum | `0` for IPG or `1` for DPG per docs |
| `result.status` | integer | Result status |
| `result.message` | string | Result message |
| `result.level` | string | Result level |

## 5. Deliver Purchase

This is used after all prior steps are done and the purchased goods or services have actually been delivered.

### Deliver Endpoint

- `POST /purchases/deliver?type={type}`

### Scope

Docs say this should only be used for credit-related payments, including:

- `CREDIT`
- `BNPL`

### Deliver Request Body

| Field | Type | Required |
| --- | --- | --- |
| `deliveryDate` | date / epoch | Yes |
| `invoiceNumber` | string | Yes |
| `trackingCode` | string | Yes |
| `products` | string array | Yes |

### Deliver Example

```bash
curl --location --request POST 'https://uat.mydigipay.info/digipay/api/purchases/deliver?type=5' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "deliveryDate": 1592502763000,
    "invoiceNumber": "7471288365484",
    "trackingCode": "5239470511667728782510",
    "products": [
      "product-4",
      "product-5",
      "product-6",
      "product-7"
    ]
  }'
```

### Deliver Response

Successful response contains only:

```json
{
  "result": {
    "status": 0,
    "message": "عملیات با موفقیت انجام شد",
    "level": "INFO"
  }
}
```

## 6. Refund

This returns money to the user after purchase.

### Refund Endpoint

- `POST /refunds?type={type}`

### Refund Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `providerId` | string | Yes | New unique refund ID, different from purchase `providerId` |
| `amount` | long | Yes | Refund amount |
| `saleTrackingCode` | string | Yes | Original purchase tracking code |

### Refund Example

```bash
curl --location --request POST 'https://uat.mydigipay.info/digipay/api/refunds?type=0' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "providerId": "1592502763000",
    "amount": 7471288365484,
    "saleTrackingCode": "5239470511667728782510"
  }'
```

### Refund response

| Field | Type | Description |
| --- | --- | --- |
| `trackingCode` | string | Refund tracking code |
| `result.title` | string | Result title |
| `result.status` | integer | Result status |
| `result.message` | string | Result message |
| `result.level` | string | Result level |

### Refund Example Response

```json
{
  "result": {
    "title": "SUCCESS",
    "status": 0,
    "message": "عملیات با موفقیت انجام شد",
    "level": "INFO"
  },
  "trackingCode": "571000000098"
}
```

## 7. Refund Inquiry

Use this to track a refund after it has been requested.

### Refund Inquiry Endpoint

- `POST /refunds/{InquiryId}?type={type}`

`InquiryId` can be the refund tracking code or the refund `providerId`.

### Refund Inquiry Response Fields

| Field | Type | Description |
| --- | --- | --- |
| `providerId` | string | Refund provider ID |
| `trackingCode` | string | Refund tracking code |
| `status` | integer | Refund status |
| `resultCode` | integer | Error/result code if refund failed |
| `transferDate` | string | Refund transfer date as epoch |
| `destinationType` | integer | Refund destination type |
| `destination` | string | Present for IBAN or PAN destinations |
| `result.title` | string | Result title |
| `result.status` | integer | Result status |
| `result.message` | string | Result message |
| `result.level` | string | Result level |

`destinationType` values:

| Code | Meaning |
| --- | --- |
| `0` | Masked PAN |
| `1` | IBAN |
| `2` | Wallet |
| `3` | Credit |

Refund `status` values:

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Failure |
| `2` | Unknown / recheck later |

## HTTP and Business Errors

### HTTP status codes

| HTTP code | Meaning |
| --- | --- |
| `200` | Success |
| `400` | Invalid input parameters |
| `401`, `403` | Authentication or authorization error |
| `422` | Business error |
| `500` | Internal error |

### Business error codes in `422`

| Code | Meaning |
| --- | --- |
| `0` | Operation completed successfully |
| `1054` | Invalid input data |
| `9000` | Purchase not found |
| `9001` | Invalid payment token |
| `9003` | Purchase expired |
| `9004` | Purchase is in progress |
| `9005` | Purchase is not payable |
| `9006` | Error communicating with payment gateway |
| `9007` | Purchase did not complete successfully |
| `9008` | A purchase with different data was already registered |
| `9009` | Verification time window has passed |
| `9010` | Purchase verification failed |
| `9011` | Purchase verification result is unknown |
| `9012` | Purchase state is invalid for this request |
| `9030` | Mobile number is required for registered users |
| `9031` | Ticket cannot be issued for this user |

## Recommended Local Order State Flow

For this project, the backend adapter should follow a conservative payment state machine:

1. Create local order in pending state.
2. Call Digipay ticket API and persist:
   - local order ID
   - Digipay purchase `providerId`
   - requested amount
   - chosen environment
   - ticket
   - redirect URL
3. Redirect customer to `redirectUrl`.
4. Receive callback.
5. Validate callback `providerId` and `amount` against local order.
6. If callback `result != SUCCESS`, mark payment attempt failed and stop.
7. If callback says success, call verify endpoint.
8. Only after successful verify:
   - mark order as paid
   - store Digipay `trackingCode`
   - store IPG/PSP details if returned
9. If later cancellation is needed:
   - use manual reverse only in the short reverse window and only where supported
   - otherwise use refund
10. For credit / BNPL purchases, call deliver when goods are actually delivered.

## Testing Checklist

### Configuration

- Confirm UAT credentials from Digipay:
  - `clientId`
  - `clientSecret`
  - `username`
  - `password`
- Confirm UAT callback URL is reachable by Digipay.
- Confirm project `baseUrl` points to UAT, not production.

### Token tests

- Login succeeds with correct Basic auth header.
- Invalid client or merchant credentials return `401`.
- Token is cached and reused until expiry.

### Ticket tests

- Ticket creation succeeds for a normal IPG payment.
- Ticket creation succeeds for direct `preferredGateway=2`.
- Ticket creation succeeds for direct `preferredGateway=0` if wallet is enabled for the merchant.
- Duplicate `providerId` handling is understood and logged.

### Callback and verify tests

- Successful callback with matching `amount` and `providerId` triggers verify.
- Callback with mismatched amount is rejected.
- Callback with mismatched `providerId` is rejected.
- Failed callback does not mark order paid.
- Verify success marks order paid exactly once.
- Repeated callback or verify calls are idempotent.

### Refund / reverse tests

- Refund request uses a new refund `providerId`.
- Manual reverse is not mixed with refund for the same purchase.
- Refund inquiry can retrieve final refund state.

### Logging and observability

- Log request correlation by local order ID and Digipay `providerId`.
- Store callback payload and verify response.
- Redact tokens and secrets in logs.

## Deployment Checklist

- Use production base URL: `https://api.mydigipay.com/digipay/api`
- Use production credentials and callback URL.
- Verify TLS and proxy settings do not strip callback requests.
- Ensure server clock is correct for auditability and time-window-sensitive operations.
- Ensure production webhook/callback route is publicly reachable.
- Monitor 401, 422, and 500 responses separately.
- Provide a manual support path for:
  - callback success but verify failure
  - unknown refund status
  - expired verification window

## Documentation Quirks and Cleanup Notes

The scraped Digipay docs include several inconsistencies. This file normalizes them where possible:

- Many examples in the original page are duplicated across PHP, Java, and .NET. This reference keeps only `curl`.
- Some original sample URLs are malformed like `http:///digipay/api/...`; this reference rewrites them using the documented base URLs.
- The reverse sample body appears once as `purchaseTrackingCode`, while the request field table uses `trackingCode`. Treat this as a documentation inconsistency and confirm with live integration if reverse is implemented.
- The docs mention `DPG` in the reverse section even though the earlier UPG overview emphasizes `IPG`, `Wallet`, `BPG`, and `CPG`.
- The docs mention refresh-token support but the scraped section does not fully document the refresh endpoint flow.

When in doubt, prefer:

1. The documented field tables over broken language snippets.
2. Live UAT behavior over malformed examples.
3. A defensive adapter implementation with full request/response logging.
