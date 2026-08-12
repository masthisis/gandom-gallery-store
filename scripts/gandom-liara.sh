#!/usr/bin/env bash
# Gandom Liara manager — interactive ops console for گندم گالری
# Usage:
#   ./scripts/gandom-liara.sh              # interactive menus
#   ./scripts/gandom-liara.sh status
#   ./scripts/gandom-liara.sh deploy:all|deploy:api|deploy:web
#   ./scripts/gandom-liara.sh restart <app>
#   ./scripts/gandom-liara.sh logs <app>
#   ./scripts/gandom-liara.sh seed:prod
set -euo pipefail

# ── Config (env-overridable) ───────────────────────────────────────────
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_APP="${API_APP:-gandom-api}"
WEB_APP="${WEB_APP:-gandom-web}"
DB_NAME="${DB_NAME:-gandom-db}"
NETWORK="${NETWORK:-gandom-net}"
API_URL="${API_URL:-https://gandom-api.liara.run}"
WEB_URL="${WEB_URL:-https://gandom-web.liara.run}"
GH_REPO="${GH_REPO:-masthisis/gandom-gallery-store}"
API_BUILD_LOC="${API_BUILD_LOC:-germany}"
WEB_BUILD_LOC="${WEB_BUILD_LOC:-iran}"
CACHE_TTL_SEC="${CACHE_TTL_SEC:-120}"

# ── Auth state ─────────────────────────────────────────────────────────
declare -a LIARA_ARGS=()
AUTH_SOURCE="none"
MASK_ENVS=1

# ── Colors ─────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'
  C_BOLD=$'\033[1m'
  C_DIM=$'\033[2m'
  C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_BLUE=$'\033[34m'
  C_CYAN=$'\033[36m'
  C_MAGENTA=$'\033[35m'
else
  C_RESET= C_BOLD= C_DIM= C_RED= C_GREEN= C_YELLOW= C_BLUE= C_CYAN= C_MAGENTA=
fi

# ── Helpers ────────────────────────────────────────────────────────────
die()  { echo "${C_RED}error:${C_RESET} $*" >&2; exit 1; }
info() { echo "${C_CYAN}→${C_RESET} $*"; }
ok()   { echo "${C_GREEN}✓${C_RESET} $*"; }
warn() { echo "${C_YELLOW}!${C_RESET} $*"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"
}

confirm() {
  local prompt="${1:-Continue?}"
  local ans
  read -r -p "${C_YELLOW}${prompt}${C_RESET} [y/N] " ans || true
  [[ "${ans,,}" == "y" || "${ans,,}" == "yes" ]]
}

prompt_line() {
  local prompt="$1" default="${2:-}"
  local ans
  if [[ -n "$default" ]]; then
    read -r -p "${prompt} [${default}]: " ans || true
    echo "${ans:-$default}"
  else
    read -r -p "${prompt}: " ans || true
    echo "$ans"
  fi
}

pause() {
  read -r -p "${C_DIM}Press Enter to continue…${C_RESET}" _ || true
}

spinner_run() {
  # spinner_run "label" cmd...
  local label="$1"; shift
  local tmp out ec
  tmp="$(mktemp)"
  if [[ -t 1 ]]; then
    (
      local frames='|/-\' i=0
      while true; do
        printf '\r%s %s ' "${C_CYAN}${frames:i++%4:1}${C_RESET}" "$label"
        sleep 0.12
      done
    ) &
    local spid=$!
    set +e
    "$@" >"$tmp" 2>&1
    ec=$?
    set -e
    kill "$spid" 2>/dev/null || true
    wait "$spid" 2>/dev/null || true
    printf '\r\033[K'
  else
    set +e
    "$@" >"$tmp" 2>&1
    ec=$?
    set -e
  fi
  out="$(cat "$tmp")"
  rm -f "$tmp"
  if [[ $ec -ne 0 ]]; then
    echo "$out" >&2
    return "$ec"
  fi
  printf '%s' "$out"
}

header() {
  clear 2>/dev/null || true
  echo "${C_BOLD}${C_MAGENTA}╔══════════════════════════════════════════════════╗${C_RESET}"
  echo "${C_BOLD}${C_MAGENTA}║   گندم گالری — Liara Ops Console                 ║${C_RESET}"
  echo "${C_BOLD}${C_MAGENTA}╚══════════════════════════════════════════════════╝${C_RESET}"
  echo "${C_DIM}auth: ${AUTH_SOURCE}  ·  api: ${API_APP}  ·  web: ${WEB_APP}${C_RESET}"
  echo
}

# ── Auth ───────────────────────────────────────────────────────────────
_liara() {
  # shellcheck disable=SC2086
  command liara "$@" ${LIARA_ARGS[@]+"${LIARA_ARGS[@]}"}
}

_probe_list() {
  # try args in $@ as extra liara flags (may be empty)
  command liara app list --output=json "$@" >/dev/null 2>&1
}

resolve_auth() {
  AUTH_SOURCE="none"
  LIARA_ARGS=()

  need_cmd liara
  need_cmd jq
  need_cmd curl

  info "Resolving Liara authentication…"

  # 1) CLI session
  if _probe_list; then
    AUTH_SOURCE="cli-session"
    LIARA_ARGS=()
    ok "Authenticated via CLI session"
    return 0
  fi

  # 2) LIARA_TOKEN env
  if [[ -n "${LIARA_TOKEN:-}" ]]; then
    if _probe_list --api-token="$LIARA_TOKEN"; then
      AUTH_SOURCE="env:LIARA_TOKEN"
      LIARA_ARGS=(--api-token="$LIARA_TOKEN")
      ok "Authenticated via \$LIARA_TOKEN"
      return 0
    fi
    warn "\$LIARA_TOKEN set but rejected by Liara"
  fi

  # 3) repo token file
  local token_file="$ROOT/liara"
  if [[ -f "$token_file" ]]; then
    local file_token
    file_token="$(tr -d '[:space:]' <"$token_file")"
    if [[ -n "$file_token" ]] && _probe_list --api-token="$file_token"; then
      AUTH_SOURCE="file:liara"
      # Export so child processes / nested calls see it; never echo it
      export LIARA_TOKEN="$file_token"
      LIARA_ARGS=(--api-token="$LIARA_TOKEN")
      ok "Authenticated via gitignored liara token file"
      return 0
    fi
    warn "liara token file present but rejected by Liara"
  fi

  warn "No working Liara auth found."
  if [[ -t 0 ]]; then
    if confirm "Run 'liara login' now?"; then
      command liara login || true
      if _probe_list; then
        AUTH_SOURCE="cli-session"
        LIARA_ARGS=()
        ok "Authenticated via CLI session after login"
        return 0
      fi
    fi
  fi

  die "Liara authentication failed. Run: liara login   or set LIARA_TOKEN / create $ROOT/liara"
}

# ── Cache ──────────────────────────────────────────────────────────────
_CACHE_DIR="${TMPDIR:-/tmp}/gandom-liara-$$"
mkdir -p "$_CACHE_DIR"
cleanup_cache() { rm -rf "$_CACHE_DIR" 2>/dev/null || true; }
trap cleanup_cache EXIT

_cache_get() {
  local key="$1" path="$_CACHE_DIR/$key" age
  [[ -f "$path" ]] || return 1
  age=$(( $(date +%s) - $(stat -c %Y "$path" 2>/dev/null || echo 0) ))
  [[ $age -le $CACHE_TTL_SEC ]] || return 1
  cat "$path"
}

_cache_set() {
  local key="$1"
  cat >"$_CACHE_DIR/$key"
}

fetch_apps_json() {
  local force="${1:-0}" cached
  if [[ "$force" != "1" ]] && cached="$(_cache_get apps.json)"; then
    printf '%s' "$cached"
    return 0
  fi
  local out
  out="$(spinner_run "Fetching apps…" _liara app list --output=json)"
  printf '%s' "$out" | _cache_set apps.json
  printf '%s' "$out"
}

fetch_dbs_json() {
  local force="${1:-0}" cached
  if [[ "$force" != "1" ]] && cached="$(_cache_get dbs.json)"; then
    printf '%s' "$cached"
    return 0
  fi
  local out
  out="$(spinner_run "Fetching databases…" _liara db list --output=json)"
  printf '%s' "$out" | _cache_set dbs.json
  printf '%s' "$out"
}

invalidate_cache() {
  rm -f "$_CACHE_DIR"/*.json 2>/dev/null || true
}

pick_app() {
  local prefer="${1:-}"
  local json names i choice
  json="$(fetch_apps_json)"
  mapfile -t names < <(echo "$json" | jq -r '.[].Name')
  if [[ ${#names[@]} -eq 0 ]]; then
    die "No apps found"
  fi
  if [[ -n "$prefer" ]]; then
    for n in "${names[@]}"; do
      [[ "$n" == "$prefer" ]] && { echo "$n"; return 0; }
    done
  fi
  echo "${C_BOLD}Select app:${C_RESET}" >&2
  for i in "${!names[@]}"; do
    printf "  %d) %s\n" "$((i + 1))" "${names[$i]}" >&2
  done
  read -r -p "Choice [1]: " choice || true
  choice="${choice:-1}"
  if [[ ! "$choice" =~ ^[0-9]+$ ]] || (( choice < 1 || choice > ${#names[@]} )); then
    die "invalid choice"
  fi
  echo "${names[$((choice - 1))]}"
}

pick_db() {
  local prefer="${1:-}"
  local json names i choice
  json="$(fetch_dbs_json)"
  mapfile -t names < <(echo "$json" | jq -r '.[].Name')
  if [[ ${#names[@]} -eq 0 ]]; then
    die "No databases found"
  fi
  if [[ -n "$prefer" ]]; then
    for n in "${names[@]}"; do
      [[ "$n" == "$prefer" ]] && { echo "$n"; return 0; }
    done
  fi
  echo "${C_BOLD}Select database:${C_RESET}" >&2
  for i in "${!names[@]}"; do
    printf "  %d) %s\n" "$((i + 1))" "${names[$i]}" >&2
  done
  read -r -p "Choice [1]: " choice || true
  choice="${choice:-1}"
  if [[ ! "$choice" =~ ^[0-9]+$ ]] || (( choice < 1 || choice > ${#names[@]} )); then
    die "invalid choice"
  fi
  echo "${names[$((choice - 1))]}"
}

# ── Status ─────────────────────────────────────────────────────────────
cmd_status() {
  local force="${1:-0}"
  local apps dbs api_code web_code

  apps="$(fetch_apps_json "$force")"
  dbs="$(fetch_dbs_json "$force")"

  echo "${C_BOLD}Apps${C_RESET}"
  echo "$apps" | jq -r '
    (["NAME","PLATFORM","PLAN","FEATURE","SCALE","STATUS","CREATED"] | @tsv),
    (.[] | [.Name, .Platform, .Plan, ."Feature plan", .Scale, .Status, ."Created At"] | @tsv)
  ' | column -t -s $'\t'
  echo
  echo "${C_BOLD}Databases${C_RESET}"
  echo "$dbs" | jq -r '
    (["NAME","TYPE","PLAN","FEATURE","SCALE","STATUS","CREATED"] | @tsv),
    (.[] | [.Name, .Type, .Plan, ."Feature plan", .Scale, .Status, ."Created At"] | @tsv)
  ' | column -t -s $'\t'
  echo
  echo "${C_BOLD}Health${C_RESET}"
  api_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$API_URL/api/store-setting" 2>/dev/null || true)"
  web_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$WEB_URL/" 2>/dev/null || true)"
  [[ -n "$api_code" ]] || api_code=000
  [[ -n "$web_code" ]] || web_code=000
  if [[ "$api_code" == "200" ]]; then
    ok "API  $API_URL  → HTTP $api_code"
  else
    warn "API  $API_URL  → HTTP $api_code"
  fi
  if [[ "$web_code" == "200" ]]; then
    ok "Web  $WEB_URL  → HTTP $web_code"
  else
    warn "Web  $WEB_URL  → HTTP $web_code"
  fi
}

menu_status() {
  while true; do
    header
    cmd_status 0
    echo
    echo "  r) Refresh    0) Back"
    read -r -p "> " c || true
    case "$c" in
      r|R) invalidate_cache; cmd_status 1; pause ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Deploy ─────────────────────────────────────────────────────────────
_restore_gitignore() {
  if [[ -f "$ROOT/backend/.gitignore.liara-bak" ]]; then
    mv -f "$ROOT/backend/.gitignore.liara-bak" "$ROOT/backend/.gitignore"
  fi
}

deploy_api() {
  info "Prebuilding Strapi admin (Liara basic plan timeout workaround)…"
  pushd "$ROOT/backend" >/dev/null
  cp .gitignore .gitignore.liara-bak
  # Ensure restore even on failure
  trap '_restore_gitignore' RETURN
  sed -i '/^dist$/d' .gitignore
  npm ci
  npm run build
  popd >/dev/null

  info "Deploying $API_APP (build-location=$API_BUILD_LOC)…"
  _liara deploy \
    --app="$API_APP" \
    --platform=docker \
    --port=1337 \
    --build-location="$API_BUILD_LOC" \
    --no-app-logs
  _restore_gitignore
  trap - RETURN
  invalidate_cache
  ok "API deploy finished"
}

deploy_web() {
  info "Deploying $WEB_APP (build-location=$WEB_BUILD_LOC)…"
  _liara deploy \
    --app="$WEB_APP" \
    --path="$ROOT/frontend" \
    --platform=docker \
    --port=80 \
    --build-arg="VITE_API_URL=$API_URL" \
    --build-location="$WEB_BUILD_LOC" \
    --no-app-logs
  invalidate_cache
  ok "Web deploy finished"
}

deploy_all() {
  deploy_api
  deploy_web
  smoke_test
}

smoke_test() {
  info "Post-deploy smoke test…"
  local api_code web_code
  api_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$API_URL/api/store-setting" 2>/dev/null || true)"
  web_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$WEB_URL/" 2>/dev/null || true)"
  [[ -n "$api_code" ]] || api_code=000
  [[ -n "$web_code" ]] || web_code=000
  if [[ "$api_code" == "200" ]]; then ok "API HTTP $api_code"; else warn "API HTTP $api_code"; fi
  if [[ "$web_code" == "200" ]]; then ok "Web HTTP $web_code"; else warn "Web HTTP $web_code"; fi
}

trigger_gh_cd() {
  need_cmd gh
  info "Triggering GitHub Actions workflow CD-Liara on $GH_REPO…"
  gh workflow run CD-Liara -R "$GH_REPO" --ref master
  sleep 4
  local run_id
  run_id="$(gh run list -R "$GH_REPO" --workflow=CD-Liara --limit 1 --json databaseId -q '.[0].databaseId')"
  if [[ -z "$run_id" || "$run_id" == "null" ]]; then
    warn "Could not resolve run id; open Actions in GitHub"
    return 1
  fi
  info "Watching run $run_id…"
  gh run watch "$run_id" -R "$GH_REPO" --exit-status
  ok "GitHub CD finished"
  invalidate_cache
  smoke_test
}

menu_deploy() {
  while true; do
    header
    echo "${C_BOLD}Deploy${C_RESET}"
    echo "  1) Full redeploy (API then Web + smoke)"
    echo "  2) API only (prebuild Strapi admin)"
    echo "  3) Web only"
    echo "  4) Trigger GitHub CD + watch"
    echo "  5) Smoke test only"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) deploy_all; pause ;;
      2) deploy_api; pause ;;
      3) deploy_web; pause ;;
      4) trigger_gh_cd; pause ;;
      5) smoke_test; pause ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── App control ────────────────────────────────────────────────────────
cmd_restart() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"
  info "Restarting $app…"
  _liara restart -a "$app"
  invalidate_cache
  ok "Restarted $app"
}

cmd_start() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app)"
  info "Starting $app…"
  _liara start -a "$app"
  invalidate_cache
  ok "Started $app"
}

cmd_stop() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app)"
  confirm "Stop app '$app'?" || return 0
  info "Stopping $app…"
  _liara stop -a "$app"
  invalidate_cache
  ok "Stopped $app"
}

menu_control() {
  while true; do
    header
    echo "${C_BOLD}App control${C_RESET}"
    echo "  1) Restart"
    echo "  2) Start"
    echo "  3) Stop"
    echo "  4) Restart API ($API_APP)"
    echo "  5) Restart Web ($WEB_APP)"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_restart; pause ;;
      2) cmd_start; pause ;;
      3) cmd_stop; pause ;;
      4) cmd_restart "$API_APP"; pause ;;
      5) cmd_restart "$WEB_APP"; pause ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Logs ───────────────────────────────────────────────────────────────
cmd_logs() {
  local app="${1:-}"
  shift || true
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"

  local follow=0 since="" release="" lines="" grep_pat=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -f|--follow) follow=1; shift ;;
      -s|--since) since="$2"; shift 2 ;;
      -r|--release) release="$2"; shift 2 ;;
      -n|--lines) lines="$2"; shift 2 ;;
      -g|--grep) grep_pat="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  local -a args=(-a "$app" -c -t)
  [[ $follow -eq 1 ]] && args+=(-f)
  [[ -n "$since" ]] && args+=(-s "$since")
  [[ -n "$release" ]] && args+=(-r "$release")
  [[ -n "$lines" ]] && args+=(-l) # last-lines flag exists; value may be positional depending on CLI

  info "Logs for $app (Ctrl+C to stop follow)…"
  if [[ -n "$grep_pat" ]]; then
    _liara logs "${args[@]}" 2>&1 | grep --line-buffered -E "$grep_pat" || true
  else
    _liara logs "${args[@]}" || true
  fi
}

menu_logs() {
  while true; do
    header
    echo "${C_BOLD}Logs${C_RESET}"
    echo "  1) Tail API (follow)"
    echo "  2) Tail Web (follow)"
    echo "  3) Choose app + options"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_logs "$API_APP" -f; pause ;;
      2) cmd_logs "$WEB_APP" -f; pause ;;
      3)
        local app since release grep_pat
        app="$(pick_app)"
        since="$(prompt_line "Since (e.g. '10 min ago', empty=all)" "")"
        release="$(prompt_line "Release (e.g. v12, empty=latest)" "")"
        grep_pat="$(prompt_line "Grep filter (empty=none)" "")"
        local -a opts=(-f)
        [[ -n "$since" ]] && opts+=(-s "$since")
        [[ -n "$release" ]] && opts+=(-r "$release")
        [[ -n "$grep_pat" ]] && opts+=(-g "$grep_pat")
        cmd_logs "$app" "${opts[@]}"
        pause
        ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Shell ──────────────────────────────────────────────────────────────
cmd_shell() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"
  info "Opening shell on $app (/bin/sh)…"
  # Alpine images — CLI default /bin/bash fails
  _liara shell -a "$app" -c /bin/sh || true
}

menu_shell() {
  while true; do
    header
    echo "${C_BOLD}Shell into app${C_RESET}"
    echo "  1) API ($API_APP)"
    echo "  2) Web ($WEB_APP)"
    echo "  3) Choose app"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_shell "$API_APP" ;;
      2) cmd_shell "$WEB_APP" ;;
      3) cmd_shell ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Env variables ──────────────────────────────────────────────────────
_mask_value() {
  local v="$1" n=${#1}
  if [[ $n -le 4 ]]; then
    printf '%s' "****"
  else
    printf '%s****%s' "${v:0:2}" "${v: -2}"
  fi
}

cmd_env_list() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"
  local json
  json="$(spinner_run "Fetching envs for $app…" _liara env list -a "$app" --output=json)"
  echo "${C_BOLD}Environment — $app${C_RESET}  ${C_DIM}(masked=$MASK_ENVS)${C_RESET}"
  echo "$json" | jq -r '
    (if type=="array" then . elif .data then .data else [.] end)[]
    | [( .key // .Key // .name // .Name // "" ), ( .value // .Value // "" )]
    | @tsv
  ' 2>/dev/null | while IFS=$'\t' read -r k v; do
    [[ -z "$k" ]] && continue
    if [[ "$MASK_ENVS" -eq 1 ]]; then
      printf "  %-32s %s\n" "$k" "$(_mask_value "$v")"
    else
      printf "  %-32s %s\n" "$k" "$v"
    fi
  done
}

cmd_env_set() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"
  local key value
  key="$(prompt_line "Key")"
  [[ -n "$key" ]] || { warn "empty key"; return 1; }
  value="$(prompt_line "Value for $key")"
  info "Setting $key on $app…"
  _liara env:set "${key}=${value}" -a "$app" -f
  ok "Set $key"
  if confirm "Restart $app now?"; then
    cmd_restart "$app"
  fi
}

cmd_env_unset() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"
  local key
  key="$(prompt_line "Key to unset")"
  [[ -n "$key" ]] || { warn "empty key"; return 1; }
  confirm "Unset $key on $app?" || return 0
  _liara env:unset "$key" -a "$app" -f
  ok "Unset $key"
  if confirm "Restart $app now?"; then
    cmd_restart "$app"
  fi
}

cmd_env_import() {
  local app="${1:-}"
  [[ -n "$app" ]] || app="$(pick_app "$API_APP")"
  local file
  file="$(prompt_line "Path to .env file" "$ROOT/backend/.env.production")"
  [[ -f "$file" ]] || die "file not found: $file"

  echo "${C_BOLD}Preview (keys only — values not shown):${C_RESET}"
  local -a pairs=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    [[ "$line" != *=* ]] && continue
    local k="${line%%=*}"
    k="${k%"${k##*[![:space:]]}"}"
    k="${k#"${k%%[![:space:]]*}"}"
    [[ -z "$k" ]] && continue
    pairs+=("$line")
    echo "  + $k"
  done <"$file"

  [[ ${#pairs[@]} -gt 0 ]] || die "no KEY=VALUE lines found"
  confirm "Apply ${#pairs[@]} variables to $app?" || return 0

  # Apply in batches to avoid huge argv
  local batch=()
  local i=0
  for line in "${pairs[@]}"; do
    batch+=("$line")
    i=$((i + 1))
    if (( i % 15 == 0 )); then
      _liara env:set "${batch[@]}" -a "$app" -f
      batch=()
    fi
  done
  if [[ ${#batch[@]} -gt 0 ]]; then
    _liara env:set "${batch[@]}" -a "$app" -f
  fi
  ok "Imported envs to $app"
  if confirm "Restart $app now?"; then
    cmd_restart "$app"
  fi
}

menu_envs() {
  while true; do
    header
    echo "${C_BOLD}Environment variables${C_RESET}"
    echo "  1) List (API)"
    echo "  2) List (Web)"
    echo "  3) List (choose app)"
    echo "  4) Set one"
    echo "  5) Unset one"
    echo "  6) Bulk import from .env file"
    if [[ "$MASK_ENVS" -eq 1 ]]; then
      echo "  7) Toggle mask → currently ON (values hidden)"
    else
      echo "  7) Toggle mask → currently OFF (values visible)"
    fi
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_env_list "$API_APP"; pause ;;
      2) cmd_env_list "$WEB_APP"; pause ;;
      3) cmd_env_list; pause ;;
      4) cmd_env_set; pause ;;
      5) cmd_env_unset; pause ;;
      6) cmd_env_import; pause ;;
      7) MASK_ENVS=$((1 - MASK_ENVS));;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Databases ──────────────────────────────────────────────────────────
cmd_db_list() {
  local force="${1:-0}"
  local dbs
  dbs="$(fetch_dbs_json "$force")"
  echo "${C_BOLD}Databases${C_RESET}"
  echo "$dbs" | jq -r '
    (["NAME","TYPE","PLAN","FEATURE","SCALE","STATUS","CREATED"] | @tsv),
    (.[] | [.Name, .Type, .Plan, ."Feature plan", .Scale, .Status, ."Created At"] | @tsv)
  ' | column -t -s $'\t'
}

cmd_db_start() {
  local db
  db="$(pick_db "$DB_NAME")"
  info "Starting database $db…"
  _liara db start -n "$db"
  invalidate_cache
  ok "Started $db"
}

cmd_db_stop() {
  local db
  db="$(pick_db "$DB_NAME")"
  confirm "Stop database '$db'?" || return 0
  info "Stopping database $db…"
  _liara db stop -n "$db"
  invalidate_cache
  ok "Stopped $db"
}

cmd_db_resize() {
  local db plan
  db="$(pick_db "$DB_NAME")"
  plan="$(prompt_line "New plan id (e.g. small-g2, medium-g2)")"
  [[ -n "$plan" ]] || { warn "empty plan"; return 1; }
  confirm "Resize $db to plan $plan?" || return 0
  info "Resizing $db…"
  _liara db resize -n "$db" --plan="$plan"
  invalidate_cache
  ok "Resize requested for $db"
}

cmd_db_psql() {
  info "Opening psql via $API_APP shell (private network)…"
  info "Using DATABASE_* env vars already set on the API container."
  # shellcheck disable=SC2016
  _liara shell -a "$API_APP" -c \
    'sh -c '"'"'command -v psql >/dev/null || (apk add --no-cache postgresql-client 2>/dev/null || apt-get update && apt-get install -y postgresql-client 2>/dev/null || true); PGPASSWORD="$DATABASE_PASSWORD" psql -h "$DATABASE_HOST" -p "${DATABASE_PORT:-5432}" -U "$DATABASE_USERNAME" -d "$DATABASE_NAME"'"'" \
    || true
}

menu_dbs() {
  while true; do
    header
    echo "${C_BOLD}Databases${C_RESET}"
    echo "  1) List"
    echo "  2) Start"
    echo "  3) Stop"
    echo "  4) Resize"
    echo "  5) psql via API shell ($API_APP → $DB_NAME)"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_db_list 1; pause ;;
      2) cmd_db_start; pause ;;
      3) cmd_db_stop; pause ;;
      4) cmd_db_resize; pause ;;
      5) cmd_db_psql ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Infra ──────────────────────────────────────────────────────────────
cmd_bucket_list() {
  info "Buckets…"
  _liara bucket list --output=json 2>/dev/null | jq -r '
    (["NAME","PERMISSION","PLAN","CREATED"] | @tsv),
    (.[] | [.Name // .name, .Permission // .permission // "", .Plan // .plan // "", ."Created At" // .createdAt // ""] | @tsv)
  ' 2>/dev/null | column -t -s $'\t' \
    || _liara bucket list
}

cmd_bucket_create() {
  local name plan perm
  name="$(prompt_line "Bucket name")"
  plan="$(prompt_line "Plan" "20g-g2")"
  perm="$(prompt_line "Permission (public|private)" "public")"
  confirm "Create bucket $name ($plan, $perm)?" || return 0
  _liara bucket create --name="$name" --plan="$plan" --permission="$perm"
  ok "Created bucket $name"
}

cmd_disk_create() {
  local app name size
  app="$(pick_app "$API_APP")"
  name="$(prompt_line "Disk name" "uploads")"
  size="$(prompt_line "Size (GB)" "5")"
  confirm "Create disk $name (${size}G) on $app?" || return 0
  _liara disk create -a "$app" -n "$name" -s "$size"
  ok "Disk create requested"
}

cmd_network_list() {
  _liara network list --output=json 2>/dev/null | jq -r '
    (["NAME","CREATED"] | @tsv),
    (.[] | [.Name // .name, ."Created At" // .createdAt // ""] | @tsv)
  ' 2>/dev/null | column -t -s $'\t' \
    || _liara network list
}

cmd_network_create() {
  local name
  name="$(prompt_line "Network name" "$NETWORK")"
  confirm "Create network $name?" || return 0
  _liara network create -n "$name"
  ok "Network create requested"
}

cmd_plan_list() {
  _liara plan list 2>/dev/null || true
}

menu_infra() {
  while true; do
    header
    echo "${C_BOLD}Buckets / disks / networks${C_RESET}"
    echo "  1) List buckets"
    echo "  2) Create bucket"
    echo "  3) Create disk"
    echo "  4) List networks"
    echo "  5) Create network"
    echo "  6) List plans"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_bucket_list; pause ;;
      2) cmd_bucket_create; pause ;;
      3) cmd_disk_create; pause ;;
      4) cmd_network_list; pause ;;
      5) cmd_network_create; pause ;;
      6) cmd_plan_list; pause ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Seed / maintenance ─────────────────────────────────────────────────
_disable_seed() {
  warn "Ensuring GANDOM_SEED=false…"
  _liara env:set GANDOM_SEED=false GANDOM_SEED_FORCE=false -a "$API_APP" -f 2>/dev/null || true
}

cmd_seed_prod() {
  confirm "Run ONE-TIME production seed on $API_APP? (downloads/bundles media, restarts API)" || return 0

  trap '_disable_seed' EXIT

  info "Enabling GANDOM_SEED=true…"
  _liara env:set GANDOM_SEED=true GANDOM_SEED_FORCE=true -a "$API_APP" -f
  info "Restarting $API_APP…"
  _liara restart -a "$API_APP"

  info "Polling store-setting until logo is JPEG (up to ~5 min)…"
  local i code mime name
  for i in $(seq 1 60); do
    code="$(curl -sS -o /tmp/gandom-seed-ss.json -w '%{http_code}' --max-time 20 \
      "$API_URL/api/store-setting?populate=logo" 2>/dev/null || true)"
    [[ -n "$code" ]] || code=000
    if [[ "$code" == "200" ]]; then
      mime="$(jq -r '.data.logo.mime // empty' /tmp/gandom-seed-ss.json 2>/dev/null || true)"
      name="$(jq -r '.data.logo.name // empty' /tmp/gandom-seed-ss.json 2>/dev/null || true)"
      echo "  try $i: HTTP $code  logo=$name  mime=$mime"
      if [[ "$mime" == "image/jpeg" ]]; then
        ok "Seed verified — logo is JPEG"
        break
      fi
    else
      echo "  try $i: HTTP $code (waiting for boot/seed)…"
    fi
    sleep 5
  done

  _disable_seed
  trap - EXIT
  info "Restarting $API_APP with seed disabled…"
  _liara restart -a "$API_APP" || true
  invalidate_cache
  smoke_test
}

menu_maint() {
  while true; do
    header
    echo "${C_BOLD}Seed & maintenance${C_RESET}"
    echo "  1) One-time production seed (GANDOM_SEED)"
    echo "  2) Force GANDOM_SEED=false now"
    echo "  3) Smoke test"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) cmd_seed_prod; pause ;;
      2) _disable_seed; if confirm "Restart $API_APP?"; then cmd_restart "$API_APP"; fi; pause ;;
      3) smoke_test; pause ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Account ────────────────────────────────────────────────────────────
menu_account() {
  while true; do
    header
    echo "${C_BOLD}Account & auth${C_RESET}"
    echo "  Active source: ${C_GREEN}${AUTH_SOURCE}${C_RESET}"
    echo "  1) Show accounts"
    echo "  2) Use account"
    echo "  3) Re-login (liara login)"
    echo "  4) Re-resolve auth chain"
    echo "  0) Back"
    read -r -p "> " c || true
    case "$c" in
      1) _liara account list || command liara account list; pause ;;
      2)
        local name
        name="$(prompt_line "Account name")"
        command liara account use "$name" || true
        resolve_auth
        pause
        ;;
      3)
        command liara login || true
        resolve_auth
        pause
        ;;
      4) resolve_auth; pause ;;
      0|"") return 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Main menu ──────────────────────────────────────────────────────────
main_menu() {
  while true; do
    header
    echo "${C_BOLD}Main menu${C_RESET}"
    echo "  1) Status dashboard"
    echo "  2) Deploy"
    echo "  3) App control (restart / start / stop)"
    echo "  4) Logs"
    echo "  5) Shell into app"
    echo "  6) Environment variables"
    echo "  7) Databases"
    echo "  8) Buckets / disks / networks"
    echo "  9) Seed & maintenance"
    echo " 10) Account & auth"
    echo "  0) Quit"
    read -r -p "> " c || true
    case "$c" in
      1) menu_status ;;
      2) menu_deploy ;;
      3) menu_control ;;
      4) menu_logs ;;
      5) menu_shell ;;
      6) menu_envs ;;
      7) menu_dbs ;;
      8) menu_infra ;;
      9) menu_maint ;;
      10) menu_account ;;
      0|q|Q) echo "bye"; exit 0 ;;
      *) warn "unknown"; sleep 1 ;;
    esac
  done
}

# ── Non-interactive dispatch ───────────────────────────────────────────
usage() {
  cat <<EOF
Usage: $(basename "$0") [command]

Interactive (no args):
  Opens the numbered menu console.

Commands:
  status                 Show apps, DBs, health
  deploy:all             Deploy API + Web + smoke
  deploy:api             Deploy API only (with Strapi prebuild)
  deploy:web             Deploy Web only
  deploy:cd              Trigger GitHub CD and watch
  smoke                  Post-deploy smoke test
  restart [app]          Restart app (default: $API_APP)
  start [app]            Start app
  stop [app]             Stop app (asks confirm interactively)
  logs [app] [-f]        Stream logs
  shell [app]            Open /bin/sh in app
  seed:prod              One-time production seed
  help                   This help

Env overrides: API_APP WEB_APP DB_NAME NETWORK API_URL WEB_URL
               GH_REPO API_BUILD_LOC WEB_BUILD_LOC LIARA_TOKEN
EOF
}

main() {
  local cmd="${1:-}"
  shift || true

  case "$cmd" in
    help|-h|--help)
      usage
      exit 0
      ;;
  esac

  resolve_auth

  case "$cmd" in
    "")
      main_menu
      ;;
    status)
      cmd_status 1
      ;;
    deploy:all)
      deploy_all
      ;;
    deploy:api)
      deploy_api
      ;;
    deploy:web)
      deploy_web
      ;;
    deploy:cd)
      trigger_gh_cd
      ;;
    smoke)
      smoke_test
      ;;
    restart)
      cmd_restart "${1:-$API_APP}"
      ;;
    start)
      cmd_start "${1:-}"
      ;;
    stop)
      cmd_stop "${1:-}"
      ;;
    logs)
      cmd_logs "${1:-$API_APP}" "${@:2}"
      ;;
    shell)
      cmd_shell "${1:-$API_APP}"
      ;;
    seed:prod)
      cmd_seed_prod
      ;;
    *)
      usage
      die "unknown command: $cmd"
      ;;
  esac
}

main "$@"
