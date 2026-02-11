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

echo "🔗 To complete setup:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Copy your project URL and anon key"
echo "3. Update .env.local with new credentials:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "4. Run: supabase db push --remote"
echo "5. Test authentication at http://localhost:3001/login"
echo ""
echo "✅ Setup script complete. Follow the steps above to finish deployment."