#!/bin/bash
# BenchBook.AI — Production Deployment to Cloudflare Pages
#
# Prerequisites:
#   1. wrangler CLI installed and authenticated: wrangler login
#   2. Cloudflare account with Pages enabled
#   3. All secrets configured (see below)
#
# This script documents the full deployment process.
# Run from the project root: ./scripts/deploy-production.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_ROOT/app"

echo "=== BenchBook.AI Production Deployment ==="
echo "Target: Cloudflare Pages"
echo ""

# ─── Step 1: Verify prerequisites ───
echo "[1/5] Checking prerequisites..."

if ! command -v wrangler &> /dev/null; then
    echo "ERROR: wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found."
    exit 1
fi

echo "  wrangler: $(wrangler --version 2>/dev/null || echo 'installed')"
echo "  node: $(node --version)"
echo ""

# ─── Step 2: Set secrets (if not already set) ───
echo "[2/5] Environment variables and secrets"
echo ""
echo "  Required secrets (set via Cloudflare Dashboard or CLI):"
echo "    wrangler pages secret put ANTHROPIC_API_KEY"
echo "    wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL"
echo "    wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "  Optional:"
echo "    wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "  Non-secret env vars (set in Cloudflare Dashboard > Pages > Settings):"
echo "    USE_CLAUDE_API=true"
echo "    ENABLE_PROMPT_CACHING=true"
echo "    NODE_VERSION=18"
echo ""

# ─── Step 3: Run Supabase migrations ───
echo "[3/5] Supabase migrations"
echo ""
echo "  Run these migrations in order via Supabase SQL Editor:"
echo "    1. supabase/migrations/20260204_initial_schema.sql"
echo "    2. supabase/migrations/20260206_waitlist.sql"
echo "    3. supabase/migrations/20260209003525_init_chat_persistence.sql"
echo "    4. supabase/migrations/20260214_research_patterns.sql"
echo "    5. supabase/migrations/20260404_rate_limiting.sql"
echo ""
echo "  Or use the CLI:"
echo "    SUPABASE_PROJECT_REF=your-ref ./scripts/deploy_supabase.sh"
echo ""

# ─── Step 4: Build for Cloudflare Pages ───
echo "[4/5] Building for Cloudflare Pages..."
cd "$APP_DIR"

# Pre-build legal corpus for Workers runtime
echo "  Pre-building legal corpus..."
node ../scripts/prebuild-corpus.js

# Build with next-on-pages
echo "  Running next-on-pages build..."
npx @cloudflare/next-on-pages

echo "  Build complete!"
echo ""

# ─── Step 5: Deploy ───
echo "[5/5] Deploying to Cloudflare Pages..."
echo ""
echo "  To deploy, run:"
echo "    cd app && npx wrangler pages deploy .vercel/output/static --project-name=benchbook-ai"
echo ""
echo "  For CI/CD (GitHub integration):"
echo "    1. Connect repo in Cloudflare Dashboard > Pages > Create"
echo "    2. Set build command: cd app && npm run build:cloudflare"
echo "    3. Set build output: app/.vercel/output/static"
echo "    4. Add environment variables in the Pages project settings"
echo ""

# ─── Domain Configuration ───
echo "=== Domain Configuration ==="
echo ""
echo "  1. In Cloudflare Dashboard > Pages > benchbook-ai > Custom domains"
echo "  2. Add: benchbook.ai"
echo "  3. Add: www.benchbook.ai"
echo "  4. DNS records are auto-configured if domain is on Cloudflare"
echo ""
echo "  If domain DNS is elsewhere, add CNAME:"
echo "    benchbook.ai -> benchbook-ai.pages.dev"
echo "    www.benchbook.ai -> benchbook-ai.pages.dev"
echo ""

echo "=== Deployment guide complete ==="
