#!/bin/bash
# BenchBook.AI — iOS Build Script
# Syncs Capacitor web assets and opens Xcode project for building/signing

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")/app"

echo "=== BenchBook.AI iOS Build ==="
echo ""

cd "$APP_DIR"

# Sync Capacitor plugins and configuration
echo "[1/2] Syncing Capacitor..."
npx cap sync ios

echo ""
echo "[2/2] Opening Xcode project..."
npx cap open ios

echo ""
echo "=== Next Steps ==="
echo "1. In Xcode, select your signing team under Signing & Capabilities"
echo "2. Set the bundle identifier to: ai.benchbook.app"
echo "3. Select a connected device or simulator"
echo "4. Press Cmd+R to build and run"
echo ""
echo "For App Store submission:"
echo "  - Product > Archive"
echo "  - Window > Organizer > Distribute App"
echo "  - Follow App Store Connect upload flow"
