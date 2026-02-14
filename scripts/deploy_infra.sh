#!/usr/bin/env bash

# BenchBook AI - SST v3 Deployment Automation
# - Installs infra dependencies
# - Sets secrets when provided via env
# - Deploys SST stage

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$ROOT_DIR/benchbook-ai-infra"
SST_STAGE="${SST_STAGE:-production}"

if [ ! -d "$INFRA_DIR" ]; then
  echo "❌ Infra directory not found: $INFRA_DIR"
  exit 1
fi

echo "📦 Installing infra dependencies..."
cd "$INFRA_DIR"
npm install

set_secret_if_present() {
  local name="$1"
  local value="$2"
  if [ -n "$value" ]; then
    echo "🔐 Setting SST secret: $name"
    npx sst secret set "$name" "$value"
  fi
}

set_secret_if_present "PineconeApiKey" "${PINECONE_API_KEY:-}"
set_secret_if_present "PineconeEnvironment" "${PINECONE_ENVIRONMENT:-}"
set_secret_if_present "PineconeIndex" "${PINECONE_INDEX:-}"
set_secret_if_present "OpenAIApiKey" "${OPENAI_API_KEY:-}"
set_secret_if_present "LangSmithApiKey" "${LANGSMITH_API_KEY:-}"

echo "🚀 Deploying SST stage: $SST_STAGE"
npx sst deploy --stage "$SST_STAGE"

echo "✅ SST deployment complete."
