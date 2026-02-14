#!/usr/bin/env bash

# BenchBook AI - RAG Deployment Helper
# Verifies embedded corpus and optionally uploads to Pinecone.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHUNKS_EMBEDDED="$ROOT_DIR/legal-corpus/_processed/chunks_embedded.json"
EXPECTED_VECTOR_COUNT="${EXPECTED_VECTOR_COUNT:-6325}"

if [ ! -f "$CHUNKS_EMBEDDED" ]; then
  echo "❌ Missing $CHUNKS_EMBEDDED"
  echo "Run: python3 scripts/ingest_local.py --prepare --embed"
  exit 1
fi

echo "🔎 Verifying embedded corpus count..."
python3 - <<PY
import json
from pathlib import Path

path = Path("legal-corpus/_processed/chunks_embedded.json")
data = json.loads(path.read_text())
count = len(data)
expected = int("${EXPECTED_VECTOR_COUNT}")
print(f"Embedded chunks: {count:,}")
if count != expected:
    raise SystemExit(f"Expected {expected:,} vectors, found {count:,}")
PY

if [ "${UPLOAD_TO_PINECONE:-0}" = "1" ]; then
  if [ -z "${PINECONE_API_KEY:-}" ]; then
    echo "❌ UPLOAD_TO_PINECONE=1 set but PINECONE_API_KEY missing."
    exit 1
  fi
  echo "☁️  Uploading vectors to Pinecone..."
  python3 scripts/ingest_local.py --pinecone
  echo "✅ Pinecone upload complete."
else
  echo "ℹ️  Set UPLOAD_TO_PINECONE=1 to upload vectors."
fi
