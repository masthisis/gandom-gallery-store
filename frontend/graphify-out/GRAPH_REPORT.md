# Graph Report - frontend  (2026-08-12)

## Corpus Check
- 47 files · ~15,928 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 291 nodes · 606 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c2c3cfd3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- SectionRenderer.tsx
- ProductPage.tsx
- Header.tsx
- format.ts
- compilerOptions
- devDependencies
- compilerOptions
- package.json
- plugins
- React + TypeScript + Vite
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `mediaUrl()` - 24 edges
2. `react` - 20 edges
3. `compilerOptions` - 18 edges
4. `toFarsiDigits()` - 17 edges
5. `formatPrice()` - 17 edges
6. `compilerOptions` - 15 edges
7. `ProductPage()` - 13 edges
8. `getToken()` - 12 edges
9. `ShopPage()` - 12 edges
10. `ProductCard()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AppShell()` --calls--> `mediaUrl()`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/lib/format.ts
- `useAddressValidation()` --calls--> `validateAddressForm()`  [EXTRACTED]
  frontend/src/components/AddressFields.tsx → frontend/src/lib/iranValidation.ts
- `resolveImage()` --calls--> `mediaUrl()`  [EXTRACTED]
  frontend/src/components/ProductCard.tsx → frontend/src/lib/format.ts
- `ProductCard()` --calls--> `formatPrice()`  [EXTRACTED]
  frontend/src/components/ProductCard.tsx → frontend/src/lib/format.ts
- `ProductCard()` --calls--> `toFarsiDigits()`  [EXTRACTED]
  frontend/src/components/ProductCard.tsx → frontend/src/lib/format.ts

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.10
Nodes (34): react, AccountPage, App(), AppShell(), CartPage, CheckoutPage, CmsPage, loadCart() (+26 more)

### Community 1 - "SectionRenderer.tsx"
Cohesion: 0.09
Nodes (36): HomePage, IncredibleOffers(), pad(), Props, useCountdown(), imageSrc(), MixedSlider(), Props (+28 more)

### Community 2 - "ProductPage.tsx"
Cohesion: 0.12
Nodes (32): Breadcrumbs(), Crumb, MegaMenu(), MegaMenuTrigger(), Props, CategoryItem, cache, CacheEntry (+24 more)

### Community 3 - "Header.tsx"
Cohesion: 0.13
Nodes (23): CartDrawer(), CartLine, Props, Footer(), TRUST, Header(), Props, MiniCartDropdown() (+15 more)

### Community 4 - "format.ts"
Cohesion: 0.13
Nodes (20): BannerGrid(), bannerImage(), Props, CategoryGrid(), catImage(), Props, HeroSlider(), Props (+12 more)

### Community 5 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 6 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, oxlint, devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @tailwindcss/vite (+15 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 8 - "package.json"
Cohesion: 0.11
Nodes (18): lucide-react, dependencies, lucide-react, react, react-dom, react-router-dom, name, private (+10 more)

### Community 9 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 10 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **105 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `SectionRenderer.tsx`, `ProductPage.tsx`, `Header.tsx`, `format.ts`, `plugins`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `mediaUrl()` connect `format.ts` to `App.tsx`, `SectionRenderer.tsx`, `ProductPage.tsx`, `Header.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `App.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10017730496453901 - nodes in this community are weakly interconnected._
- **Should `SectionRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08599033816425121 - nodes in this community are weakly interconnected._
- **Should `ProductPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11948790896159317 - nodes in this community are weakly interconnected._