#!/usr/bin/env bash

# BenchBook AI - Supabase Deployment Automation
# - Links Supabase project
# - Pushes migrations
# - Optionally writes env keys to app/.env.local and .env.local

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ENV_FILE="$ROOT_DIR/app/.env.local"
ROOT_ENV_FILE="$ROOT_DIR/.env.local"

if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install with: npm install -g supabase@latest"
  exit 1
fi

if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  echo "❌ SUPABASE_PROJECT_REF is required."
  echo "   Example: SUPABASE_PROJECT_REF=your-project-ref ./scripts/deploy_supabase.sh"
  exit 1
fi

echo "🔗 Linking Supabase project: ${SUPABASE_PROJECT_REF}"
supabase link --project-ref "$SUPABASE_PROJECT_REF"

echo "📦 Applying migrations..."
supabase db push

write_env_line() {
  local file="$1"
  local key="$2"
  local value="$3"
  if [ ! -f "$file" ]; then
    touch "$file"
  fi
  if grep -q "^${key}=" "$file"; then
    perl -i -pe "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

if [ "${BB_WRITE_ENV:-0}" = "1" ]; then
  if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
    echo "❌ BB_WRITE_ENV=1 set but NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing."
    exit 1
  fi
  echo "📝 Writing Supabase keys to env files..."
  write_env_line "$APP_ENV_FILE" "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
  write_env_line "$APP_ENV_FILE" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
  write_env_line "$ROOT_ENV_FILE" "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
  write_env_line "$ROOT_ENV_FILE" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

echo "✅ Supabase deployment complete."
echo "Next: sign up via the app and run supabase/seed-demo-data.sql in SQL Editor if you want demo data."
