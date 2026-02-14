#!/bin/bash

# BenchBook AI - Supabase Setup Script
# Sets up new Supabase project and migrates database schema

set -e

echo "🏗️  BenchBook AI - Supabase Setup"
echo "=================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase@latest
fi

# Initialize Supabase project (if not already done)
if [ ! -f "supabase/config.toml" ]; then
    echo "📋 Initializing Supabase project..."
    supabase init
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ENV_FILE="$ROOT_DIR/app/.env.local"
ROOT_ENV_FILE="$ROOT_DIR/.env.local"

echo "🔗 To complete setup:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Copy your project URL and anon key"
echo "3. Update environment files with new credentials:"
echo ""
echo "  $APP_ENV_FILE"
echo "  $ROOT_ENV_FILE  (used by local RAG tools)"
echo ""
echo "  NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "4. Link and push migrations:"
echo "  supabase link --project-ref <your-project-ref>"
echo "  supabase db push"
echo ""
echo "5. Test authentication at http://localhost:3000/login"
echo ""
echo "Optional automation:"
echo "  SUPABASE_PROJECT_REF=your-project-ref ./scripts/setup_supabase.sh"
echo ""

if [ -n "${SUPABASE_PROJECT_REF:-}" ]; then
    echo "🔧 Linking Supabase project: $SUPABASE_PROJECT_REF"
    supabase link --project-ref "$SUPABASE_PROJECT_REF"
    echo "📦 Applying migrations..."
    supabase db push
    echo "✅ Migrations applied."
fi

echo "✅ Setup script complete. Follow the steps above to finish deployment."
