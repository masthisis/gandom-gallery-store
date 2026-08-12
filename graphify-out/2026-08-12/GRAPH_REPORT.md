# Graph Report - gandom_galery_shop  (2026-08-12)

## Corpus Check
- 278 files · ~88,421 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1546 nodes · 2440 edges · 179 communities (147 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c2c3cfd3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- gandom-liara.sh
- SectionRenderer.tsx
- api-client.ts
- devDependencies
- ProductPage.tsx
- controllers/profile.ts
- plugins
- DESIGN.md -- DigiKala | دیجی کالا (Community)
- seed-persian.ts
- AccountPage.tsx
- compilerOptions
- gandom-shop/package.json
- compilerOptions
- index.jsx
- What You Must Do When Invoked
- Project & Session Knowledge — گندم گالری
- compilerOptions
- format.ts
- scripts
- App.tsx
- compilerOptions
- Liara production — گندم گالری
- 00-index.md
- dependencies
- Gandom Shop Admin Plugin
- mediaUrl
- Digipay UPG Adapter
- Strapi Bootstrap
- services/payment.js
- Security checklist — گندم گالری (vibe-coded app hardening)
- 🚀 Getting started with Strapi
- react
- AGENTS.md — گندم گالری
- Digipay UPG API Reference
- گندم گالری — Plan Index
- Phase 1: Foundation
- 1. Create Purchase Ticket
- main
- compilerOptions
- Iran Validation Utility
- Digikala parity — Storefront + Strapi Admin
- backend/package.json
- Strapi Backend
- devDependencies
- scripts
- Phase 2 — WebbyCommerce + Persian workarounds
- Phase 3 — Auth + SMS.ir
- Phase 4 — Digipay UPG
- Phase 5: Homepage CMS
- Phase 6 — Storefront
- Phase 7 — Backoffice
- Phase 12 — SMS Admin + Test Harness
- sms-harness.sh
- graphify reference: extra exports and benchmark
- React + TypeScript + Vite
- payment-settings.js
- sms-settings.js
- Authentication
- 3. Verify Payment
- Testing Checklist
- graphify reference: query, path, explain
- 4. Manual Reverse
- 5. Deliver Purchase
- 6. Refund
- plugins.ts
- Phase 11 — Payment Admin + E2E Harness
- payment-harness.sh
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- lifecycles.js
- 2. Payment Result Callback
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Digipay Payment Gateway
- Phase 3: Auth & SMS
- middlewares.ts
- graphify
- 7. Refund Inquiry
- frontend/tsconfig.json
- extraction-spec.md
- config/api.ts
- fix-webbycommerce-fa.js
- react
- @strapi/plugin-cloud
- @strapi/plugin-users-permissions
- ShopOwnerShell.tsx
- nodemailer.d.ts
- 08-content-policies.md
- graphify-mcp.sh
- liara-deploy-api.sh
- verify-memory-setup.sh
- wait-for-url.sh
- Design System
- Frontend Entry Point
- Super Admin
- Nodemailer Utility
- Admin Notification Dispatcher
- Shop Owner Role Utility
- Super Admin User Utility
- controllers/auth-otp.ts
- mailer.ts
- src/index.js
- sms-admin-settings-admin-S-c084a-s-and-test-connection-works-chromium/error-context.md
- sms-dev-login-storefront-dev-OTP-login-chromium/error-context.md
- sms-sandbox-login-storefront-sandbox-OTP-login-via-DB-OTP-chromium/error-context.md
- CategoryFilterTree.tsx
- seed-bulk-data.ts
- index.ts
- seed-upload.ts
- services/product.js
- repair-bulk-documents.js
- controllers/index.js
- cm-persian-labels.ts
- mediaUrl
- nodemailer

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `apiRequest()` - 26 edges
3. `mediaUrl()` - 24 edges
4. `_liara()` - 24 edges
5. `toFarsiDigits()` - 21 edges
6. `ok()` - 20 edges
7. `warn()` - 20 edges
8. `register()` - 18 edges
9. `compilerOptions` - 18 edges
10. `info()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Digipay Adapter` --implements--> `Strapi 5`  [INFERRED]
  docs/architecture.md → README.md
- `SMS.ir Adapter` --implements--> `Strapi 5`  [INFERRED]
  docs/architecture.md → README.md
- `CD-Liara Workflow` --references--> `Strapi Backend`  [INFERRED]
  .github/workflows/liara-cd.yml → backend/README.md
- `CD-Liara Workflow` --references--> `Frontend React App`  [INFERRED]
  .github/workflows/liara-cd.yml → frontend/README.md
- `Phase 7: Backoffice UX` --conceptually_related_to--> `Strapi Backend`  [INFERRED]
  docs/plans/07-backoffice-ux.md → backend/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Gandom Gallery Development Roadmap** — repo::docs_plans_01_foundation_foundation, repo::docs_plans_02_webbycommerce_webbycommerce, repo::docs_plans_03_auth_sms_auth_sms, repo::docs_plans_04_payment_digipay_payment_digipay, repo::docs_plans_05_homepage_cms_homepage_cms, repo::docs_plans_06_storefront_ux_storefront_ux, repo::docs_plans_07_backoffice_ux_backoffice_ux, repo::docs_plans_09_qa_launch_qa_launch [EXTRACTED 1.00]
- **Core Technology Stack** — repo::strapi_5, repo::webbycommerce, repo::liara_cloud [EXTRACTED 1.00]
- **OTP Authentication Flow** — repo::sms_ir_adapter, repo::strapi_5, repo::docs_plans_index [INFERRED 0.85]
- **Third-Party Service Integrations** — repo::webbycommerce_plugin, repo::digipay_gateway, repo::sms_ir_service [INFERRED 0.85]

## Communities (179 total, 32 thin omitted)

### Community 0 - "gandom-liara.sh"
Cohesion: 0.12
Nodes (61): _cache_set(), cmd_bucket_create(), cmd_bucket_list(), cmd_db_list(), cmd_db_psql(), cmd_db_resize(), cmd_db_start(), cmd_db_stop() (+53 more)

### Community 1 - "SectionRenderer.tsx"
Cohesion: 0.07
Nodes (46): HomePage, BannerGrid(), bannerImage(), Props, CategoryGrid(), catImage(), Props, HeroSlider() (+38 more)

### Community 2 - "api-client.ts"
Cohesion: 0.07
Nodes (67): resetSettingsViaAdmin(), runCheckoutAndTicket(), stub, addToCart(), adminGetPayment(), adminGetPaymentSettings(), adminGetSmsGoLiveChecklist(), adminGetSmsSettings() (+59 more)

### Community 3 - "devDependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, dependencies, lucide-react, react, react-dom, react-router-dom, devDependencies, autoprefixer (+33 more)

### Community 4 - "ProductPage.tsx"
Cohesion: 0.10
Nodes (36): ProductPage, Breadcrumbs(), Crumb, OrderRowSkeleton(), ProductCardSkeleton(), ProductGridSkeleton(), Props, ReviewSkeleton() (+28 more)

### Community 5 - "controllers/profile.ts"
Cohesion: 0.08
Nodes (46): callback(), createTicket(), getAccessToken(), getPaymentSettings(), PaymentSettings, refund(), resolveUser(), resolveUserPhone() (+38 more)

### Community 6 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 7 - "DESIGN.md -- DigiKala | دیجی کالا (Community)"
Cohesion: 0.07
Nodes (26): 10. Extending this system, 11. Machine-readable tokens, 1. Identity, 2. Structure, 3. Color, 4. Typography, 5. Spacing & Layout, 6. Depth & Motion (+18 more)

### Community 8 - "seed-persian.ts"
Cohesion: 0.12
Nodes (29): bulkSeedSummary(), CustomerSeed, FavoriteSeed, isBulkSeedEnabled(), categoryTree, CatSeed, clearGhostRowsForSlug(), customers (+21 more)

### Community 9 - "AccountPage.tsx"
Cohesion: 0.22
Nodes (17): AccountPage, AddressFields(), Province, useAddressValidation(), ListingPaginationFooter(), api, AddressFormValues, EMPTY_ADDRESS (+9 more)

### Community 10 - "compilerOptions"
Cohesion: 0.06
Nodes (31): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, incremental, lib, module, moduleResolution, noEmitOnError (+23 more)

### Community 11 - "gandom-shop/package.json"
Cohesion: 0.07
Nodes (28): dependencies, description, exports, ./package.json, ./strapi-admin, ./strapi-server, react, react-dom (+20 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module (+18 more)

### Community 13 - "index.jsx"
Cohesion: 0.06
Nodes (37): applyNavFilter(), BLOCKED_PREFIXES, HIDE_NAV_HREFS, hideHomeAdminWidgets(), isShopOwnerOnly(), ShopOwnerShell(), CategoriesIcon(), CommentsIcon() (+29 more)

### Community 14 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 15 - "Project & Session Knowledge — گندم گالری"
Cohesion: 0.08
Nodes (23): Admin roles, Categories, Commands & ops, Comments & moderation, Content Manager (Persian), Conversation arc (what the user asked for), Dashboard metrics (`server/src/services/dashboard.js`), Email notifications (Liara SMTP) (+15 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 17 - "format.ts"
Cohesion: 0.15
Nodes (22): CartDrawer(), CartLine, Props, Header(), Props, MiniCartDropdown(), Props, normalizeList() (+14 more)

### Community 18 - "scripts"
Cohesion: 0.08
Nodes (25): @playwright/test, devDependencies, pg, @playwright/test, tsx, @types/node, typescript, vitest (+17 more)

### Community 19 - "App.tsx"
Cohesion: 0.11
Nodes (18): App(), AppShell(), CartPage, CheckoutPage, CmsPage, loadCart(), PaymentCallbackPage, ShopPage (+10 more)

### Community 20 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 21 - "Liara production — گندم گالری"
Cohesion: 0.06
Nodes (32): Digipay Adapter, Architecture — گندم گالری, After env changes, Architecture, Console, Default Liara URLs (before custom domain), Deploy, Deploy notes (Strapi build timeout) (+24 more)

### Community 23 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @chartbrew/plugin-strapi, pg, react-dom, react-router-dom, @strapi/database, @strapi/provider-upload-aws-s3, @strapi/strapi (+11 more)

### Community 25 - "mediaUrl"
Cohesion: 0.28
Nodes (11): mapNode(), tree(), componentType(), find(), mapProduct(), mapSlide(), parseIds(), resolveProducts() (+3 more)

### Community 28 - "services/payment.js"
Cohesion: 0.21
Nodes (9): findOrderForProvider(), getPayment(), listPayments(), markOrderFailed(), markOrderPaid(), parseGatewayMeta(), path, refundPayment() (+1 more)

### Community 29 - "Security checklist — گندم گالری (vibe-coded app hardening)"
Cohesion: 0.13
Nodes (13): Backup note, Functional, Ops, QA & Launch Checklist — گندم گالری, Security, Strapi Admin (Shop Owner), Admin accounts (two roles), Admin surface (+5 more)

### Community 30 - "🚀 Getting started with Strapi"
Cohesion: 0.25
Nodes (7): `build`, ✨ Community, ⚙️ Deployment, `develop`, 🚀 Getting started with Strapi, 📚 Learn more, `start`

### Community 31 - "react"
Cohesion: 0.23
Nodes (7): InfiniteScrollSentinel(), Props, Props, pageNumbers(), PaginationBar(), Props, react

### Community 32 - "AGENTS.md — گندم گالری"
Cohesion: 0.29
Nodes (6): AGENTS.md — گندم گالری, Commands, Locked decisions, Memory & context (graphify + Headroom), Graphify, Headroom

### Community 33 - "Digipay UPG API Reference"
Cohesion: 0.17
Nodes (11): Business error codes in `422`, Deployment Checklist, Digipay UPG API Reference, Documentation Quirks and Cleanup Notes, Environments, HTTP and Business Errors, HTTP status codes, Quick Reference (+3 more)

### Community 34 - "گندم گالری — Plan Index"
Cohesion: 0.50
Nodes (4): Architecture lock, Architecture lock (updated), Phase docs, گندم گالری — Plan Index

### Community 35 - "Phase 1: Foundation"
Cohesion: 0.29
Nodes (6): Acceptance, Phase 1: Foundation, Goals, Phase 2: WebbyCommerce Integration, Digikala Parity Strategy, WebbyCommerce Plugin

### Community 36 - "1. Create Purchase Ticket"
Cohesion: 0.17
Nodes (12): 1. Create Purchase Ticket, Basket details, Direct IPG example, Direct Wallet example, Preferred gateway, Project integration notes, Split details, Standard ticket example (+4 more)

### Community 37 - "main"
Cohesion: 0.35
Nodes (10): Path, cursor_running(), main(), quit_cursor(), cursor_running(), main(), patch_settings_json(), quit_cursor() (+2 more)

### Community 38 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, skipLibCheck, strict, target, types (+3 more)

### Community 40 - "Digikala parity — Storefront + Strapi Admin"
Cohesion: 0.33
Nodes (5): Admin, Categories, Digikala parity — Storefront + Strapi Admin, Homepage, Storefront

### Community 41 - "backend/package.json"
Cohesion: 0.18
Nodes (10): description, engines, node, npm, name, private, strapi, installId (+2 more)

### Community 42 - "Strapi Backend"
Cohesion: 0.40
Nodes (5): Strapi Backend, Phase 6: Storefront UX, Phase 7: Backoffice UX, Frontend React App, CD-Liara Workflow

### Community 43 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, @types/node, @types/nodemailer, @types/react, @types/react-dom, typescript, @types/node, @types/react (+3 more)

### Community 44 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, console, deploy, dev, develop, postinstall, seed (+4 more)

### Community 45 - "Phase 2 — WebbyCommerce + Persian workarounds"
Cohesion: 0.40
Nodes (4): Acceptance, Locked workarounds, Phase 2 — WebbyCommerce + Persian workarounds, Principle

### Community 46 - "Phase 3 — Auth + SMS.ir"
Cohesion: 0.40
Nodes (4): Acceptance, Flow, Phase 3 — Auth + SMS.ir, Settings (sms-setting)

### Community 47 - "Phase 4 — Digipay UPG"
Cohesion: 0.40
Nodes (4): Acceptance, Flow, Phase 4 — Digipay UPG, Settings (payment-setting)

### Community 48 - "Phase 5: Homepage CMS"
Cohesion: 0.40
Nodes (4): Acceptance, API, Phase 5: Homepage CMS, Sections (JSON on homepage single-type)

### Community 49 - "Phase 6 — Storefront"
Cohesion: 0.40
Nodes (4): Acceptance, Pages, Phase 6 — Storefront, UX

### Community 50 - "Phase 7 — Backoffice"
Cohesion: 0.40
Nodes (4): Acceptance, Auth, Modules, Phase 7 — Backoffice

### Community 52 - "Phase 12 — SMS Admin + Test Harness"
Cohesion: 0.29
Nodes (6): Admin API, Manual checklist, Notifications, Phase 12 — SMS Admin + Test Harness, Run harness, Sandbox vs production (SMS.ir)

### Community 54 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 56 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 57 - "payment-settings.js"
Cohesion: 0.33
Nodes (7): clearDigipayTokenCache(), derivePaymentMode(), getAccessToken(), getPaymentSettings(), maskPaymentSettings(), testDigipayConnection(), updatePaymentSettings()

### Community 59 - "sms-settings.js"
Cohesion: 0.13
Nodes (28): notifySms(), { sendSmsEvent }, CUSTOMER_EVENTS, DEFAULT_EVENT_TEMPLATES, digitsOnly(), EVENT_LABELS_FA, isValidSmsLineNumber(), mergeEventTemplates() (+20 more)

### Community 60 - "Authentication"
Cohesion: 0.25
Nodes (8): Auth Endpoint, Auth Example, Auth Request Body, Authentication, Authentication model, Example response, Integration notes, Success response

### Community 61 - "3. Verify Payment"
Cohesion: 0.29
Nodes (7): 3. Verify Payment, Verify Endpoint, Verify example, Verify Integration Notes, Verify Request Body, Verify response, Verify response example

### Community 62 - "Testing Checklist"
Cohesion: 0.29
Nodes (7): Callback and verify tests, Configuration, Logging and observability, Refund / reverse tests, Testing Checklist, Ticket tests, Token tests

### Community 63 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 64 - "4. Manual Reverse"
Cohesion: 0.33
Nodes (6): 4. Manual Reverse, Constraints from the docs, Response fields, Reverse Endpoint, Reverse Example, Reverse Request Body

### Community 65 - "5. Deliver Purchase"
Cohesion: 0.33
Nodes (6): 5. Deliver Purchase, Deliver Endpoint, Deliver Example, Deliver Request Body, Deliver Response, Scope

### Community 66 - "6. Refund"
Cohesion: 0.33
Nodes (6): 6. Refund, Refund Endpoint, Refund Example, Refund Example Response, Refund Request Body, Refund response

### Community 67 - "plugins.ts"
Cohesion: 0.50
Nodes (4): allowedMediaTypes, config(), deniedExecutableTypes, uploadConfig()

### Community 68 - "Phase 11 — Payment Admin + E2E Harness"
Cohesion: 0.40
Nodes (4): Admin features, Gate tests, Phase 11 — Payment Admin + E2E Harness, Run harness

### Community 69 - "payment-harness.sh"
Cohesion: 0.40
Nodes (3): DIGIPAY_STUB_HOST, DIGIPAY_STUB_PORT, payment-harness.sh script

### Community 70 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 71 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 72 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 73 - "lifecycles.js"
Cohesion: 0.83
Nodes (3): afterCreate(), afterUpdate(), upsertWcCategory()

### Community 74 - "2. Payment Result Callback"
Cohesion: 0.50
Nodes (4): 2. Payment Result Callback, Callback payload, Callback `type` codes, Important verification rule

### Community 82 - "7. Refund Inquiry"
Cohesion: 0.67
Nodes (3): 7. Refund Inquiry, Refund Inquiry Endpoint, Refund Inquiry Response Fields

### Community 89 - "fix-webbycommerce-fa.js"
Cohesion: 0.40
Nodes (4): fs, minimal, path, target

### Community 93 - "ShopOwnerShell.tsx"
Cohesion: 0.13
Nodes (18): bootstrap(), applyNavFilter(), BLOCKED_PREFIXES, HIDE_NAV_HREFS, hideHomeAdminWidgets(), isShopOwnerOnly(), ShopOwnerShell(), BLOCKED_PATHS (+10 more)

### Community 159 - "controllers/auth-otp.ts"
Cohesion: 0.57
Nodes (5): isValidIranMobile(), normalizePhone(), request(), smsHelpers(), verify()

### Community 160 - "mailer.ts"
Cohesion: 0.60
Nodes (4): isMailConfigured(), mailConfig(), MailPayload, sendMail()

### Community 161 - "src/index.js"
Cohesion: 0.22
Nodes (5): bootstrap, controllers, register, routes, services

### Community 162 - "sms-admin-settings-admin-S-c084a-s-and-test-connection-works-chromium/error-context.md"
Cohesion: 0.50
Nodes (3): Error details, Instructions, Test info

### Community 163 - "sms-dev-login-storefront-dev-OTP-login-chromium/error-context.md"
Cohesion: 0.50
Nodes (3): Error details, Instructions, Test info

### Community 164 - "sms-sandbox-login-storefront-sandbox-OTP-login-via-DB-OTP-chromium/error-context.md"
Cohesion: 0.50
Nodes (3): Error details, Instructions, Test info

### Community 165 - "CategoryFilterTree.tsx"
Cohesion: 0.20
Nodes (15): CategoryFilterTree(), CategoryNode(), isActive(), nodeKey(), Props, MegaMenu(), MegaMenuTrigger(), Props (+7 more)

### Community 166 - "seed-bulk-data.ts"
Cohesion: 0.09
Nodes (26): buildBulkSeedCatalog(), BULK_CUSTOMER_COUNT, BULK_PRODUCTS_PER_ROOT, BULK_ROOT_COUNT, BULK_SUBS_PER_ROOT, BulkSeedCatalog, CatSeed, CITIES (+18 more)

### Community 167 - "index.ts"
Cohesion: 0.18
Nodes (14): bootstrap(), ensureDefaultSettings(), ensurePublicPermissions(), repairWebbycommerceFaJson(), registerNotificationHooks(), CONTENT_SUBJECTS, CONTENT_TYPE_FIELDS, ensureShopOwnerRole() (+6 more)

### Community 168 - "seed-upload.ts"
Cohesion: 0.24
Nodes (10): ASSETS_ROOT, cache, extFromContentType(), findExistingByName(), mimeFor(), resolveAsset(), uploadLocalFile(), UploadResult (+2 more)

### Community 169 - "services/product.js"
Cohesion: 0.07
Nodes (25): create(), findOne(), list(), mapCategoryRow(), remove(), resolveParentDocumentId(), update(), getLowStockThreshold() (+17 more)

### Community 170 - "repair-bulk-documents.js"
Cohesion: 0.53
Nodes (5): countBulk(), countCmDocuments(), main(), path, purgeBulkGhostData()

### Community 174 - "controllers/index.js"
Cohesion: 0.33
Nodes (5): category, dashboard, payment, product, sms

### Community 176 - "cm-persian-labels.ts"
Cohesion: 0.33
Nodes (8): applyLabels(), CmConfig, ensureCmPersianLabels(), ensureProductLayoutFields(), loadCmConfig(), NAV_CATEGORY_LABELS, PRODUCT_LABELS, saveCmConfig()

### Community 177 - "mediaUrl"
Cohesion: 0.23
Nodes (12): mediaUrl(), convertMarkdownInline(), looksLikeHtml(), normalizeHtmlImages(), productDescriptionHtml(), resolveDescUrl(), DEFAULTS, normalizeStore() (+4 more)

## Knowledge Gaps
- **595 isolated node(s):** `/home/mas/Projects/gandom_galery_shop/scripts/graphify-mcp.sh`, `config`, `config`, `allowedMediaTypes`, `deniedExecutableTypes` (+590 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `SectionRenderer.tsx`, `ProductPage.tsx`, `CategoryFilterTree.tsx`, `plugins`, `AccountPage.tsx`, `index.jsx`, `format.ts`, `mediaUrl`, `App.tsx`, `ShopOwnerShell.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Digipay UPG API Reference` connect `Digipay UPG API Reference` to `4. Manual Reverse`, `5. Deliver Purchase`, `6. Refund`, `1. Create Purchase Ticket`, `2. Payment Result Callback`, `7. Refund Inquiry`, `Authentication`, `3. Verify Payment`, `Testing Checklist`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `react`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `/home/mas/Projects/gandom_galery_shop/scripts/graphify-mcp.sh`, `config`, `config` to the rest of the system?**
  _595 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `gandom-liara.sh` be split into smaller, more focused modules?**
  _Cohesion score 0.11985526910900045 - nodes in this community are weakly interconnected._
- **Should `SectionRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06604324956165984 - nodes in this community are weakly interconnected._
- **Should `api-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06526806526806526 - nodes in this community are weakly interconnected._