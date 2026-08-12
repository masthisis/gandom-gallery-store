# Graph Report - gandom_galery_shop  (2026-08-12)

## Corpus Check
- 211 files · ~60,627 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 987 nodes · 1582 edges · 120 communities (104 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e3360213`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AccountPage.tsx
- Liara CLI Scripts
- seed-persian.ts
- format.ts
- controllers/profile.ts
- ProductPage.tsx
- Admin Dashboard Controllers
- Design System Documentation
- Graphify Extraction Logic
- App TypeScript Configuration
- Node TypeScript Configuration
- Admin Plugin Pages
- gandom-shop/package.json
- dependencies
- compilerOptions
- devDependencies
- Storefront Data Mapping
- compilerOptions
- scripts
- plugins
- index.ts
- Liara Deployment Ops
- QA and Launch Checklists
- react
- ShopPage.tsx
- Graphify Export Formats
- App.tsx
- formatPrice
- graphify-mcp.sh
- verify-memory-setup.sh
- Backend Documentation
- SMS OTP Authentication
- Agent and Context Docs
- Architecture and Adapters
- Project Index and Policies
- Foundation and Integration Strategy
- Security and Hardening
- Admin Configuration Guide
- Graphify Query Reference
- Digikala Parity Planning
- Media Upload Configuration
- Project Roadmap Phases
- Deployment and Plugin Overview
- Environment Variable Management
- WebbyCommerce Persian Workarounds
- Auth and SMS Implementation
- Digipay Integration Flow
- Homepage CMS Configuration
- Storefront UX Design
- Backoffice Module UX
- Graphify Watch Commands
- Git Hook Integration
- Incremental Update Logic
- Database Lifecycle Hooks
- Frontend Development Guide
- GitHub Repository Integration
- Media Transcription Reference
- Middleware Security Config
- graphify
- Frontend Project References
- Extraction Agent Specification
- API Configuration
- Nodemailer Type Definitions
- Digipay Payment Phase
- SMS Service Phase
- Liara API Deployment
- Design System
- Frontend Entry Point
- Super Admin

## God Nodes (most connected - your core abstractions)
1. `react` - 24 edges
2. `_liara()` - 24 edges
3. `mediaUrl()` - 22 edges
4. `ok()` - 20 edges
5. `warn()` - 20 edges
6. `compilerOptions` - 18 edges
7. `info()` - 18 edges
8. `main()` - 18 edges
9. `toFarsiDigits()` - 17 edges
10. `formatPrice()` - 17 edges

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
- **Gandom Gallery Development Roadmap** — docs_plans_01_foundation_foundation, docs_plans_02_webbycommerce_webbycommerce, docs_plans_03_auth_sms_auth_sms, docs_plans_04_payment_digipay_payment_digipay, docs_plans_05_homepage_cms_homepage_cms, docs_plans_06_storefront_ux_storefront_ux, docs_plans_07_backoffice_ux_backoffice_ux, docs_plans_09_qa_launch_qa_launch [EXTRACTED 1.00]
- **Core Technology Stack** — strapi_5, webbycommerce, liara_cloud [EXTRACTED 1.00]
- **OTP Authentication Flow** — sms_ir_adapter, strapi_5, docs_plans_index [INFERRED 0.85]
- **Third-Party Service Integrations** — webbycommerce_plugin, digipay_gateway, sms_ir_service [INFERRED 0.85]

## Communities (120 total, 16 thin omitted)

### Community 0 - "AccountPage.tsx"
Cohesion: 0.16
Nodes (23): AccountPage, CheckoutPage, AddressFields(), Province, useAddressValidation(), AuthModal(), Props, api (+15 more)

### Community 1 - "Liara CLI Scripts"
Cohesion: 0.12
Nodes (61): _cache_set(), cmd_bucket_create(), cmd_bucket_list(), cmd_db_list(), cmd_db_psql(), cmd_db_resize(), cmd_db_start(), cmd_db_stop() (+53 more)

### Community 2 - "seed-persian.ts"
Cohesion: 0.10
Nodes (29): categoryTree, CatSeed, customers, ensureCustomer(), localPx(), pages, products, ProductSeed (+21 more)

### Community 3 - "format.ts"
Cohesion: 0.06
Nodes (54): HomePage, BannerGrid(), bannerImage(), Props, CategoryGrid(), catImage(), Props, HeroSlider() (+46 more)

### Community 4 - "controllers/profile.ts"
Cohesion: 0.13
Nodes (31): add(), hydrateProducts(), list(), remove(), status(), toggle(), list(), province() (+23 more)

### Community 5 - "ProductPage.tsx"
Cohesion: 0.20
Nodes (14): Breadcrumbs(), Crumb, mergeProductMeta(), metasFromResponse(), parseGalleryUrls(), parseSpecs(), ProductMetaMap, SpecItem (+6 more)

### Community 6 - "Admin Dashboard Controllers"
Cohesion: 0.08
Nodes (9): dashboard, bootstrap, controllers, register, routes, services, getLowStockThreshold(), overview() (+1 more)

### Community 7 - "Design System Documentation"
Cohesion: 0.07
Nodes (26): 10. Extending this system, 11. Machine-readable tokens, 1. Identity, 2. Structure, 3. Color, 4. Typography, 5. Spacing & Layout, 6. Depth & Motion (+18 more)

### Community 8 - "Graphify Extraction Logic"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 9 - "App TypeScript Configuration"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 10 - "Node TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 11 - "Admin Plugin Pages"
Cohesion: 0.19
Nodes (11): CommentsIcon(), CustomersIcon(), PluginIcon(), register(), CustomersPage(), formatToman(), STATUS_FA, DashboardPage() (+3 more)

### Community 12 - "gandom-shop/package.json"
Cohesion: 0.07
Nodes (28): dependencies, description, exports, ./package.json, ./strapi-admin, ./strapi-server, react, react-dom (+20 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, @chartbrew/plugin-strapi, nodemailer, pg, react, react-dom, react-router-dom, @strapi/database (+19 more)

### Community 14 - "compilerOptions"
Cohesion: 0.06
Nodes (31): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, incremental, lib, module, moduleResolution, noEmitOnError (+23 more)

### Community 15 - "devDependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, dependencies, lucide-react, react, react-dom, react-router-dom, devDependencies, autoprefixer (+33 more)

### Community 16 - "Storefront Data Mapping"
Cohesion: 0.28
Nodes (11): mapNode(), tree(), componentType(), find(), mapProduct(), mapSlide(), parseIds(), resolveProducts() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module (+18 more)

### Community 18 - "scripts"
Cohesion: 0.06
Nodes (32): description, devDependencies, @types/node, @types/nodemailer, @types/react, @types/react-dom, typescript, engines (+24 more)

### Community 19 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 20 - "index.ts"
Cohesion: 0.10
Nodes (33): callback(), createTicket(), getAccessToken(), getPaymentSettings(), PaymentSettings, refund(), resolveUser(), tomanToRial() (+25 more)

### Community 21 - "Liara Deployment Ops"
Cohesion: 0.18
Nodes (11): Architecture, Default Liara URLs (before custom domain), Deploy, Deploy notes (Strapi build timeout), Future custom domain, GitHub secrets, Install CLI, Liara production — گندم گالری (+3 more)

### Community 22 - "QA and Launch Checklists"
Cohesion: 0.20
Nodes (8): Checklist, Phase 9: QA & Launch, Backup note, Functional, Ops, QA & Launch Checklist — گندم گالری, Security, Strapi Admin (Shop Owner)

### Community 23 - "react"
Cohesion: 0.12
Nodes (20): MegaMenu(), MegaMenuTrigger(), Props, Footer(), TRUST, Header(), Props, normalizeList() (+12 more)

### Community 24 - "ShopPage.tsx"
Cohesion: 0.24
Nodes (13): cache, CacheEntry, getCached(), getCategoryTree(), getProductMetas(), discountPct(), effectivePrice(), flattenCategories() (+5 more)

### Community 25 - "Graphify Export Formats"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 26 - "App.tsx"
Cohesion: 0.21
Nodes (8): App(), AppShell(), CmsPage, loadCart(), PaymentCallbackPage, ProductPage, ShopPage, Toast()

### Community 27 - "formatPrice"
Cohesion: 0.35
Nodes (9): CartPage, CartDrawer(), CartLine, Props, MiniCartDropdown(), Props, formatPrice(), toFarsiDigits() (+1 more)

### Community 30 - "Backend Documentation"
Cohesion: 0.25
Nodes (7): `build`, ✨ Community, ⚙️ Deployment, `develop`, 🚀 Getting started with Strapi, 📚 Learn more, `start`

### Community 31 - "SMS OTP Authentication"
Cohesion: 0.57
Nodes (7): getSmsSettings(), isDevOtpMode(), isValidIranMobile(), normalizePhone(), request(), sendSmsIrVerify(), verify()

### Community 32 - "Agent and Context Docs"
Cohesion: 0.29
Nodes (6): AGENTS.md — گندم گالری, Commands, Locked decisions, Memory & context (graphify + Headroom), Graphify, Headroom

### Community 33 - "Architecture and Adapters"
Cohesion: 0.38
Nodes (6): Digipay Adapter, Architecture — گندم گالری, Gandom Shop Plugin, Shop Owner, SMS.ir Adapter, Strapi 5

### Community 34 - "Project Index and Policies"
Cohesion: 0.29
Nodes (5): Architecture lock, Architecture lock (updated), Phase docs, گندم گالری — Plan Index, Phase 8 — Content & policies

### Community 35 - "Foundation and Integration Strategy"
Cohesion: 0.29
Nodes (6): Acceptance, Phase 1: Foundation, Goals, Phase 2: WebbyCommerce Integration, Digikala Parity Strategy, WebbyCommerce Plugin

### Community 36 - "Security and Hardening"
Cohesion: 0.29
Nodes (7): Admin accounts (two roles), Admin surface, Auth & sessions, Data / payments, Ops, Secrets & config, Security checklist — گندم گالری (vibe-coded app hardening)

### Community 37 - "Admin Configuration Guide"
Cohesion: 0.29
Nodes (7): Admin email notifications (Liara), Content Manager (Persian labels), Menu (plugin فروشگاه گندم), Quick start, Shop owner admin, Stack, گندم گالری

### Community 38 - "Graphify Query Reference"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 40 - "Digikala Parity Planning"
Cohesion: 0.33
Nodes (5): Admin, Categories, Digikala parity — Storefront + Strapi Admin, Homepage, Storefront

### Community 41 - "Media Upload Configuration"
Cohesion: 0.50
Nodes (4): allowedMediaTypes, config(), deniedExecutableTypes, uploadConfig()

### Community 42 - "Project Roadmap Phases"
Cohesion: 0.40
Nodes (5): Strapi Backend, Phase 6: Storefront UX, Phase 7: Backoffice UX, Frontend React App, CD-Liara Workflow

### Community 43 - "Deployment and Plugin Overview"
Cohesion: 0.40
Nodes (3): Plan Index, Liara Cloud, WebbyCommerce

### Community 44 - "Environment Variable Management"
Cohesion: 0.40
Nodes (5): After env changes, Console, Environment variables (best practice), Required production highlights, Set / edit (CLI preferred)

### Community 45 - "WebbyCommerce Persian Workarounds"
Cohesion: 0.40
Nodes (4): Acceptance, Locked workarounds, Phase 2 — WebbyCommerce + Persian workarounds, Principle

### Community 46 - "Auth and SMS Implementation"
Cohesion: 0.40
Nodes (4): Acceptance, Flow, Phase 3 — Auth + SMS.ir, Settings (sms-setting)

### Community 47 - "Digipay Integration Flow"
Cohesion: 0.40
Nodes (4): Acceptance, Flow, Phase 4 — Digipay UPG, Settings (payment-setting)

### Community 48 - "Homepage CMS Configuration"
Cohesion: 0.40
Nodes (4): Acceptance, API, Phase 5: Homepage CMS, Sections (JSON on homepage single-type)

### Community 49 - "Storefront UX Design"
Cohesion: 0.40
Nodes (4): Acceptance, Pages, Phase 6 — Storefront, UX

### Community 50 - "Backoffice Module UX"
Cohesion: 0.40
Nodes (4): Acceptance, Auth, Modules, Phase 7 — Backoffice

### Community 51 - "Graphify Watch Commands"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 52 - "Git Hook Integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 53 - "Incremental Update Logic"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 55 - "Database Lifecycle Hooks"
Cohesion: 0.83
Nodes (3): afterCreate(), afterUpdate(), upsertWcCategory()

### Community 56 - "Frontend Development Guide"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **391 isolated node(s):** `/home/mas/Projects/gandom_galery_shop/scripts/graphify-mcp.sh`, `config`, `config`, `allowedMediaTypes`, `deniedExecutableTypes` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `AccountPage.tsx`, `format.ts`, `ProductPage.tsx`, `Admin Plugin Pages`, `plugins`, `ShopPage.tsx`, `App.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `mediaUrl()` connect `format.ts` to `App.tsx`, `ProductPage.tsx`, `react`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `/home/mas/Projects/gandom_galery_shop/scripts/graphify-mcp.sh`, `config`, `config` to the rest of the system?**
  _391 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Liara CLI Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.11985526910900045 - nodes in this community are weakly interconnected._
- **Should `seed-persian.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10160427807486631 - nodes in this community are weakly interconnected._
- **Should `format.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06233538191395961 - nodes in this community are weakly interconnected._
- **Should `controllers/profile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12944523470839261 - nodes in this community are weakly interconnected._