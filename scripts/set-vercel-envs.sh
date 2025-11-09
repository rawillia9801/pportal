#!/usr/bin/env bash
set -euo pipefail

# 0) Ensure CLI is ready and you’re on the right team
vercel whoami >/dev/null || vercel login
# Pick the team you want if needed (press arrow keys):
vercel switch

# 1) Link this folder to the Vercel project (accept defaults if already linked)
vercel link --yes >/dev/null

# 2) Helper to upsert an env var for an environment
put() {
  local name="$1" val="$2" env="$3"
  vercel env rm "$name" "$env" --yes >/dev/null 2>&1 || true
  printf "%s" "$val" | vercel env add "$name" "$env" >/dev/null
  echo "Set $name for $env"
}

URL="https://eejkkbdahgluqjeuxezh.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlamtrYmRhaGdsdXFqZXV4ZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Njc0NDAsImV4cCI6MjA3ODE0MzQ0MH0.y162vMegReD_LTv0pS_KmSfLrxlqd7t0QTM9VhJzpcc"

# For SITE_URL use:
# - production: your production Vercel URL/domain
# - preview: any vercel-preview URL is fine (or same as prod)
# - development: http://localhost:3000
SITE_PROD="https://pportal.vercel.app"       # <-- change to your actual prod domain if different
SITE_PREV="$SITE_PROD"
SITE_DEV="http://localhost:3000"

for ENV in production preview development; do
  put NEXT_PUBLIC_SUPABASE_URL "$URL" "$ENV"
  put NEXT_PUBLIC_SUPABASE_ANON_KEY "$KEY" "$ENV"
done

put NEXT_PUBLIC_SITE_URL "$SITE_PROD" production
put NEXT_PUBLIC_SITE_URL "$SITE_PREV" preview
put NEXT_PUBLIC_SITE_URL "$SITE_DEV"  development

echo
vercel env ls
