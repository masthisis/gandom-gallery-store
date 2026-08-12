# Graph Report - .  (2026-08-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 971 nodes · 1580 edges · 125 communities (110 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.72)
- Token cost: 3,331 input · 1,191 output

## Graph Freshness
- Built from commit: `e3360213`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend Core Components
- Liara CLI Scripts
- Backend Initialization and Mail
- Homepage Banners and Grids
- Payment and Product Controllers
- Catalog and Navigation UI
- Admin Dashboard Controllers
- Design System Documentation
- Graphify Extraction Logic
- App TypeScript Configuration
- Node TypeScript Configuration
- Admin Plugin Pages
- Strapi Package Metadata
- Backend Dependencies
- Compiler Build Settings
- Frontend Build Tools
- Storefront Data Mapping
- Shared TypeScript Config
- Backend Project Metadata
- Linting and Code Quality
- Strapi Lifecycle Scripts
- Liara Deployment Ops
- QA and Launch Checklists
- Core Framework Peer Dependencies
- Frontend Project Metadata
- Graphify Export Formats
- React UI Dependencies
- TypeScript Type Definitions
- Admin Build Paths
- Build Ignore Patterns
- Backend Documentation
- SMS OTP Authentication
- Agent and Context Docs
- Architecture and Adapters
- Project Index and Policies
- Foundation and Integration Strategy
- Security and Hardening
- Admin Configuration Guide
- Graphify Query Reference
- Backend File Inclusion
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
- TypeScript Library Targets
- Database Lifecycle Hooks
- Frontend Development Guide
- GitHub Repository Integration
- Media Transcription Reference
- Middleware Security Config
- Styled Components Library
- React DOM Types
- MCP Server Configuration
- Frontend Project References
- Extraction Agent Specification
- API Configuration
- Strapi Permissions Plugin
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
6. `info()` - 18 edges
7. `main()` - 18 edges
8. `compilerOptions` - 18 edges
9. `formatPrice()` - 17 edges
10. `toFarsiDigits()` - 17 edges

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

## Communities (125 total, 15 thin omitted)

### Community 0 - "Frontend Core Components"
Cohesion: 0.06
Nodes (60): AccountPage, App(), AppShell(), CartPage, CheckoutPage, CmsPage, loadCart(), PaymentCallbackPage (+52 more)

### Community 1 - "Liara CLI Scripts"
Cohesion: 0.12
Nodes (61): _cache_set(), cmd_bucket_create(), cmd_bucket_list(), cmd_db_list(), cmd_db_psql(), cmd_db_resize(), cmd_db_start(), cmd_db_stop() (+53 more)

### Community 2 - "Backend Initialization and Mail"
Cohesion: 0.06
Nodes (54): bootstrap(), ensureDefaultSettings(), ensurePublicPermissions(), isMailConfigured(), mailConfig(), MailPayload, sendMail(), getLowStockThreshold() (+46 more)

### Community 3 - "Homepage Banners and Grids"
Cohesion: 0.07
Nodes (49): HomePage, BannerGrid(), bannerImage(), Props, CategoryGrid(), catImage(), Props, HeroSlider() (+41 more)

### Community 4 - "Payment and Product Controllers"
Cohesion: 0.10
Nodes (39): callback(), createTicket(), getAccessToken(), getPaymentSettings(), PaymentSettings, refund(), resolveUser(), tomanToRial() (+31 more)

### Community 5 - "Catalog and Navigation UI"
Cohesion: 0.12
Nodes (32): ProductPage, Breadcrumbs(), Crumb, MegaMenu(), MegaMenuTrigger(), Props, cache, CacheEntry (+24 more)

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

### Community 12 - "Strapi Package Metadata"
Cohesion: 0.11
Nodes (17): dependencies, description, exports, ./package.json, ./strapi-admin, ./strapi-server, name, strapi (+9 more)

### Community 13 - "Backend Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @chartbrew/plugin-strapi, nodemailer, pg, react, @strapi/database, @strapi/plugin-cloud, @strapi/provider-upload-aws-s3 (+9 more)

### Community 14 - "Compiler Build Settings"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, incremental, lib, module, moduleResolution, noEmitOnError (+8 more)

### Community 15 - "Frontend Build Tools"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @tailwindcss/vite, vite (+7 more)

### Community 16 - "Storefront Data Mapping"
Cohesion: 0.28
Nodes (11): mapNode(), tree(), componentType(), find(), mapProduct(), mapSlide(), parseIds(), resolveProducts() (+3 more)

### Community 17 - "Shared TypeScript Config"
Cohesion: 0.14
Nodes (14): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, jsx, module, moduleResolution (+6 more)

### Community 18 - "Backend Project Metadata"
Cohesion: 0.18
Nodes (10): description, engines, node, npm, name, private, strapi, installId (+2 more)

### Community 19 - "Linting and Code Quality"
Cohesion: 0.18
Nodes (10): typescript, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, typescript, oxc (+2 more)

### Community 20 - "Strapi Lifecycle Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, console, deploy, dev, develop, seed, start (+3 more)

### Community 21 - "Liara Deployment Ops"
Cohesion: 0.18
Nodes (11): Architecture, Default Liara URLs (before custom domain), Deploy, Deploy notes (Strapi build timeout), Future custom domain, GitHub secrets, Install CLI, Liara production — گندم گالری (+3 more)

### Community 22 - "QA and Launch Checklists"
Cohesion: 0.20
Nodes (9): Checklist, Phase 9: QA & Launch, Backup note, Functional, Ops, QA & Launch Checklist — گندم گالری, Security, Strapi Admin (Shop Owner) (+1 more)

### Community 23 - "Core Framework Peer Dependencies"
Cohesion: 0.20
Nodes (10): react-router-dom, @strapi/strapi, react-router-dom, @strapi/strapi, react, peerDependencies, react, react-router-dom (+2 more)

### Community 24 - "Frontend Project Metadata"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 25 - "Graphify Export Formats"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 26 - "React UI Dependencies"
Cohesion: 0.22
Nodes (9): react-dom, react-dom, react-dom, dependencies, lucide-react, react, react-dom, react (+1 more)

### Community 27 - "TypeScript Type Definitions"
Cohesion: 0.22
Nodes (9): devDependencies, @types/node, @types/nodemailer, @types/react, @types/node, @types/react, @types/node, @types/react (+1 more)

### Community 28 - "Admin Build Paths"
Cohesion: 0.22
Nodes (8): exclude, include, ./, build/, dist/, node_modules/, ../plugins/**/admin/src/**/*, **/*.test.ts

### Community 29 - "Build Ignore Patterns"
Cohesion: 0.22
Nodes (9): exclude, build/, dist/, .cache/, src/admin/, src/plugins/**, .strapi/, **/*.test.* (+1 more)

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

### Community 39 - "Backend File Inclusion"
Cohesion: 0.33
Nodes (5): include, ./, ./**/*.js, src/**/*.json, ./**/*.ts

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

### Community 54 - "TypeScript Library Targets"
Cohesion: 0.50
Nodes (4): lib, DOM, DOM.Iterable, ESNext

### Community 55 - "Database Lifecycle Hooks"
Cohesion: 0.83
Nodes (3): afterCreate(), afterUpdate(), upsertWcCategory()

### Community 56 - "Frontend Development Guide"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 60 - "Styled Components Library"
Cohesion: 0.67
Nodes (3): styled-components, styled-components, styled-components

### Community 61 - "React DOM Types"
Cohesion: 0.67
Nodes (3): @types/react-dom, @types/react-dom, @types/react-dom

## Knowledge Gaps
- **368 isolated node(s):** `Province`, `Props`, `Props`, `Props`, `Props` (+363 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Frontend Core Components` to `Linting and Code Quality`, `Homepage Banners and Grids`, `Admin Plugin Pages`, `Catalog and Navigation UI`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `plugins` connect `Linting and Code Quality` to `Frontend Core Components`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `Province`, `Props`, `Props` to the rest of the system?**
  _368 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Core Components` be split into smaller, more focused modules?**
  _Cohesion score 0.060814687320711415 - nodes in this community are weakly interconnected._
- **Should `Liara CLI Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.11985526910900045 - nodes in this community are weakly interconnected._
- **Should `Backend Initialization and Mail` be split into smaller, more focused modules?**
  _Cohesion score 0.057342657342657345 - nodes in this community are weakly interconnected._
- **Should `Homepage Banners and Grids` be split into smaller, more focused modules?**
  _Cohesion score 0.06768905341089371 - nodes in this community are weakly interconnected._