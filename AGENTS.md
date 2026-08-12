# AGENTS.md — گندم گالری

## Memory & context (graphify + Headroom)

This repo has a **graphify knowledge graph** at `graphify-out/` (**987 nodes**, code + docs). Use it as primary codebase memory:

```bash
graphify query "<question>"     # scoped subgraph — use BEFORE Read/Grep/Glob
graphify path "<A>" "<B>"       # dependency path between symbols
graphify explain "<concept>"    # node neighborhood
graphify update .               # refresh after code edits (AST-only, free)
```

- Read `graphify-out/GRAPH_REPORT.md` for architecture overview; `graphify-out/gandom_galery_shop-callflow.html` for call-flow diagrams.
- MCP: `.cursor/mcp.json` → `graphify` tools (`query_graph`, `shortest_path`, etc.).
- Git hooks auto-rebuild on commit. Verify: `scripts/verify-memory-setup.sh`.
- Gemini key: `GOOGLE_API_KEY` in `.env` (gitignored) or `~/.zshrc` — [AI Studio keys](https://aistudio.google.com/app/apikey).

**Headroom** compresses LLM context (~90% savings, `agent-90` profile). Proxy: `http://127.0.0.1:8787` (persistent, memory on).

| Client | Base URL override |
|--------|-------------------|
| Cursor (OpenAI models) | `http://127.0.0.1:8787/p/gandom_galery_shop/v1` |
| Cursor (Anthropic models) | `http://127.0.0.1:8787/p/gandom_galery_shop` |
| Claude Code / Codex | auto via `headroom init` → `~/.claude/settings.json`, `~/.codex/config.toml` |

Cursor: **Settings → Models → Override OpenAI Base URL** (see `.cursor/rules/headroom.mdc`).

Workflow: **graphify query → targeted Read → edit → graphify update**.

## Locked decisions

1. Use `@webbycrown/webbycommerce` — do not rebuild ecommerce in custom APIs.
2. Remove any custom `products`/`orders` collection that collides with the plugin.
3. Persian-only customer storefront; **Shop Owner Strapi Admin is Persian**. Super Admin (developer) may use English.
4. Digipay UPG + SMS.ir via thin adapters; configure via Strapi content-types (store/SMS/payment settings).
5. Dev OTP code: `11111` (non-production only).
6. **Admin UI = Strapi `/admin` only** — plugin `gandom-shop` for dashboard / comments / customers.
7. Homepage is a Strapi **dynamic zone** of section components (not raw JSON for owners).
8. Plans live under `docs/plans/`.
9. Two admins: Super Admin (`SUPER_ADMIN_*`) + Shop Owner (`SHOP_OWNER_*`) from env — never commit passwords.
## Commands

- Stack: `docker compose up --build` from repo root
- Frontend (local): `npm run dev` in `frontend/`
- Backend: Strapi in Docker (`gandom_strapi_dev`) — use compose, not Sail unless in a Sail project
- After `src/admin` or plugin admin changes: restart Strapi so admin rebuilds (`docker restart gandom_strapi_dev`)
