#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Faltan CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID."
  exit 1
fi
npx --yes wrangler@4 pages project create finiquitolab --production-branch main || true
npx --yes wrangler@4 pages deploy . --project-name finiquitolab
