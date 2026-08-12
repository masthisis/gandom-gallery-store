# Liara production — گندم گالری

Canonical docs: [https://docs.liara.ir/](https://docs.liara.ir/) · CLI index: [CLI about](https://docs.liara.ir/llms/references/cli/about.md)

## Architecture

| Service | Liara ID | Type |
|---------|----------|------|
| Strapi API | `gandom-api` | Docker (port 1337) |
| Storefront | `gandom-web` | Docker / nginx (port 80) |
| Database | `gandom-db` | PostgreSQL DBaaS (private network only) |
| Media | `gandom-media` | Object Storage bucket |
| Network | `gandom-net` | Private network (API ↔ DB) |

Compose is **not** deployed as one unit on Liara. See [Docker Compose on Liara](https://docs.liara.ir/paas/docker/how-tos/deploy-docker-compose/).

## Install CLI

```bash
npm install -g @liara/cli
liara -v
```

Use the API token from the local gitignored `liara` file (or GitHub secret `LIARA_API_TOKEN`):

```bash
export LIARA_TOKEN="$(cat liara)"
# every command: --api-token="$LIARA_TOKEN"
```

Docs: [install](https://docs.liara.ir/references/cli/install/)

## Provision (one-time)

List plans first:

```bash
liara plan:list --api-token="$LIARA_TOKEN"
```

Docs: [plans](https://docs.liara.ir/references/cli/see-platform-plans/)

Create Postgres **without** public network (`type` must be `postgres`, not `postgresql`):

```bash
printf 'n\n' | liara db create \
  -n gandom-db \
  -t postgres \
  -v 16.10 \
  --network=gandom-net \
  --plan=small-g2 \
  --feature-plan=basic \
  -y \
  --api-token="$LIARA_TOKEN"
```

Docs: [create-db](https://docs.liara.ir/references/cli/create-db/)

Create Docker apps on the same network (`feature-plan` is one of `free|basic|standard|pro`; pair with a compatible app plan):

```bash
liara create --app=gandom-api --platform=docker --network=gandom-net --plan=small-g2 --feature-plan=basic -r false --api-token="$LIARA_TOKEN"
liara create --app=gandom-web --platform=docker --network=gandom-net --plan=small-g2 --feature-plan=basic --api-token="$LIARA_TOKEN"
```

Docs: [create-app](https://docs.liara.ir/references/cli/create-app/)

Create media bucket (object-storage plan IDs like `20g-g2`, not PaaS `medium-g2`). After delete, names can stay reserved briefly — pick a new name if needed:

```bash
liara bucket create --name=gandom-media --permission=public --plan=20g-g2 --api-token="$LIARA_TOKEN"
# Then create a key in console (SDK keys) and set AWS_* envs on gandom-api.
```

Until Object Storage is attached, media uses the `uploads` disk on `gandom-api` (`/opt/app/public/uploads`).

Set `PUBLIC_URL=https://gandom-api.liara.run` on the API (never the storefront URL). Media links must use the API host (or S3 CDN). The storefront nginx also proxies `/uploads/*` to the API as a fallback.

Docs: [create-bucket](https://docs.liara.ir/references/cli/create-bucket/)

Optional uploads disk (fallback; primary media is Object Storage):

```bash
liara disk:create -a gandom-api -n uploads -s 5 --api-token="$LIARA_TOKEN"
```

Docs: [disks](https://docs.liara.ir/references/cli/manage-disks/) — mount path is in root `liara.json` (`/opt/app/public/uploads`).

## Environment variables (best practice)

**Never** commit production `.env`. **Never** put secrets in committed `liara.json` `envs` (that replaces all panel envs — see [liara.json](https://docs.liara.ir/paas/liarajson/)).

Template: [`backend/.env.production.example`](../backend/.env.production.example)

### Set / edit (CLI preferred)

```bash
liara env:set KEY=value ANOTHER=value -a gandom-api -f --api-token="$LIARA_TOKEN"
```

Docs: [env:set](https://docs.liara.ir/references/cli/add-or-edit-envs/)

List:

```bash
liara env:list -a gandom-api --api-token="$LIARA_TOKEN"
```

Docs: [list-envs](https://docs.liara.ir/references/cli/list-envs/)

Remove:

```bash
liara env:unset KEY -a gandom-api -f --api-token="$LIARA_TOKEN"
```

Docs: [remove-env](https://docs.liara.ir/references/cli/remove-env/)

### Console

App → Settings → Variables — [platform envs](https://docs.liara.ir/paas/details/envs/)

### After env changes

```bash
liara restart -a gandom-api --api-token="$LIARA_TOKEN"
```

Docs: [restart](https://docs.liara.ir/references/cli/restart-app/)

### Required production highlights

- `FRONTEND_URL` = public storefront URL (CORS)
- `DIGIPAY_CALLBACK_URL` = `{FRONTEND_URL}/payment/callback`
- DB host/user/password from Liara DB “how to connect” (private hostname)
- S3: `AWS_*` / `CDN_URL` from bucket SDK settings
- `GANDOM_SEED=false` — do **not** set `OTP_DEV_CODE` or `ALLOW_DEV_OTP_IN_PRODUCTION`

## Ops console (recommended)

Interactive Bash manager for redeploy + day-to-day Liara ops:

```bash
./scripts/gandom-liara.sh
```

Auth resolves automatically (CLI session → `$LIARA_TOKEN` → gitignored `liara` file). Never prints the token.

Non-interactive shortcuts:

```bash
./scripts/gandom-liara.sh status
./scripts/gandom-liara.sh deploy:all      # API (Strapi prebuild) + web + smoke
./scripts/gandom-liara.sh deploy:api
./scripts/gandom-liara.sh deploy:web
./scripts/gandom-liara.sh deploy:cd       # trigger GitHub CD + watch
./scripts/gandom-liara.sh restart gandom-api
./scripts/gandom-liara.sh logs gandom-api -f
./scripts/gandom-liara.sh shell gandom-api
./scripts/gandom-liara.sh seed:prod       # one-time demo seed; always disables after
```

Menus cover: status, deploy, restart/start/stop, logs, Alpine shell (`/bin/sh`), env list/set/unset/import, databases (incl. `psql` via API shell), buckets/disks/networks, production seed, account/login.

Legacy shim: `./scripts/liara-deploy-api.sh` → `gandom-liara.sh deploy:api`.

## Deploy

Local / manual (or use the ops console above):

```bash
# API (repo root) — prefer the console so Strapi admin is prebuilt
./scripts/gandom-liara.sh deploy:api

# Storefront
./scripts/gandom-liara.sh deploy:web
```

Raw CLI equivalent:

```bash
# API (repo root) — remember to prebuild admin for basic plan timeout
liara deploy --app=gandom-api --api-token="$LIARA_TOKEN" --platform=docker --port=1337 --build-location=germany --no-app-logs

# Storefront
liara deploy --app=gandom-web --path=frontend --api-token="$LIARA_TOKEN" --platform=docker --port=80 \
  --build-arg="VITE_API_URL=https://gandom-api.liara.run" --build-location=iran --no-app-logs
```

Docs: [deploy](https://docs.liara.ir/references/cli/deploy-app/)

CI/CD: on push to `master`, [`.github/workflows/liara-cd.yml`](../.github/workflows/liara-cd.yml) runs the same deploys. See [GitHub CI/CD](https://docs.liara.ir/cicd/github/).

### GitHub secrets

| Secret | Value |
|--------|--------|
| `LIARA_API_TOKEN` | API token (same as local `liara` file) |
| `VITE_API_URL` | Public API base, e.g. `https://gandom-api.liara.run` |

Set in GitHub → repo **Settings → Secrets and variables → Actions** (requires write access on `masthisis/gandom-gallery-store`).

```bash
# From a machine authenticated as a repo admin (gh auth as the repo owner):
gh secret set LIARA_API_TOKEN --repo masthisis/gandom-gallery-store < liara
gh secret set VITE_API_URL --repo masthisis/gandom-gallery-store -b 'https://gandom-api.liara.run'
```

Note: `basic` feature plan has a **5-minute** build timeout — too short for cold Strapi builds. Prefer `--feature-plan=standard` (15 min) or `pro` (60 min) when creating `gandom-api`. If recreate fails with “enough balance to cover one week's cost”, top up credit in the Liara console.

## Logs & ops

Prefer `./scripts/gandom-liara.sh` (status / logs / shell / env / db menus).

Raw CLI:

```bash
liara logs -a gandom-api --api-token="$LIARA_TOKEN"
liara app list --api-token="$LIARA_TOKEN"
liara db list --api-token="$LIARA_TOKEN"
liara bucket list --api-token="$LIARA_TOKEN"
```

## Future custom domain

1. Optional DNS zone: `liara zone create -z example.com --api-token="$LIARA_TOKEN"` — [create-domain](https://docs.liara.ir/references/cli/create-domain/)
2. In console, attach apex / `www` to `gandom-web` and `api.` to `gandom-api` with SSL — [domains](https://docs.liara.ir/paas/domains/about/)
3. Update API envs: `FRONTEND_URL`, `DIGIPAY_CALLBACK_URL`
4. Update GitHub secret `VITE_API_URL` to `https://api.example.com` and redeploy `gandom-web` (Vite bakes URL at build time)
5. Restart `gandom-api` after env change

## Deploy notes (Strapi build timeout)

Liara **basic** feature plan allows only ~**5 minutes** of remote Docker build. Strapi admin compile exceeds that.

**Required flow:** run `npm ci && npm run build` inside `backend/` before `liara deploy`, and temporarily remove the `dist` line from `backend/.gitignore` so the archive includes the admin build (GitHub Actions does this). Prefer upgrading `gandom-api` to `--feature-plan=standard` (15 min) when account credit allows so full remote builds work without prebuilding.

## Default Liara URLs (before custom domain)

- Store: `https://gandom-web.liara.run`
- Admin / API: `https://gandom-api.liara.run` · `/admin`
