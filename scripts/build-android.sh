#!/bin/bash
# BenchBook.AI — Android Build Script
# Syncs Capacitor web assets and builds APK or opens Android Studio

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")/app"

echo "=== BenchBook.AI Android Build ==="
echo ""

cd "$APP_DIR"

# Sync Capacitor plugins and configuration
echo "[1/3] Syncing Capacitor..."
npx cap sync android

# Check if --apk flag passed for command-line build
if [ "$1" = "--apk" ]; then
    echo ""
    echo "[2/3] Building debug APK..."
    cd android
    ./gradlew assembleDebug

    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "[3/3] APK built successfully!"
    echo "  Location: android/$APK_PATH"
    echo ""
    echo "Install on connected device:"
    echo "  adb install android/$APK_PATH"
elif [ "$1" = "--release" ]; then
    echo ""
    echo "[2/3] Building release AAB..."
    cd android
    ./gradlew bundleRelease

    AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "[3/3] AAB built successfully!"
    echo "  Location: android/$AAB_PATH"
    echo ""
    echo "Upload to Google Play Console for distribution."
else
    echo ""
    echo "[2/3] Opening Android Studio..."
    npx cap open android

    echo ""
    echo "=== Next Steps ==="
    echo "1. In Android Studio, wait for Gradle sync to complete"
    echo "2. Select a connected device or emulator"
    echo "3. Press Run (green play button) to build and run"
    echo ""
    echo "For command-line builds:"
    echo "  ./scripts/build-android.sh --apk      # Debug APK"
    echo "  ./scripts/build-android.sh --release   # Release AAB for Play Store"
fi
