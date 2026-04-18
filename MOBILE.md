# BenchBook.AI. Mobile App Guide

## Architecture: Live Server Mode

The mobile apps use **Capacitor** to wrap the production web app in a native WebView. There is no static export or embedded bundle, the WebView loads directly from the Cloudflare Pages URL.

```
┌─────────────────────────────────────────────────┐
│  iOS / Android Native Shell (Capacitor)         │
│  ┌───────────────────────────────────────────┐  │
│  │  WKWebView / Android WebView              │  │
│  │  → https://benchbook.ai                   │  │
│  │    ├── Next.js Frontend (Cloudflare Pages) │  │
│  │    └── /api/chat (Cloudflare Workers)     │  │
│  │         └── Claude API → Legal Corpus     │  │
│  └───────────────────────────────────────────┘  │
│  Native Plugins: Splash Screen, Status Bar,     │
│  Browser (external links)                       │
└─────────────────────────────────────────────────┘
```

**Why live server mode?**
- API routes (chat, auth) run server-side on Cloudflare Workers, they can't run in a static WebView
- Updates deploy instantly via Cloudflare without App Store review cycles
- The `legal-corpus/` directory stays server-side only, never bundled into the app binary
- Single codebase, single deployment target

---

## Development Setup

### Prerequisites
- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods (`sudo gem install cocoapods`)

### Local Development

1. Start the Next.js dev server:
   ```bash
   cd app && npm run dev
   ```

2. Update `capacitor.config.ts` to point to localhost:
   ```typescript
   server: {
     url: 'http://localhost:3000',
     cleartext: true,  // Allow HTTP for local dev
   }
   ```

3. Sync and run:
   ```bash
   npx cap sync ios   # or android
   npx cap open ios    # opens Xcode
   ```

4. For iOS Simulator, use `http://localhost:3000`.
   For Android Emulator, use `http://10.0.2.2:3000` (emulator's alias for host localhost).

### Production Mode

Set `server.url` back to `https://benchbook.ai` (or use the `CAPACITOR_SERVER_URL` environment variable) and sync before building for release.

---

## Build & Submission

### iOS (App Store)

#### Build
```bash
./scripts/build-ios.sh
```

This syncs Capacitor and opens the Xcode project. Then:

1. **Signing:** Select your Apple Developer team under Signing & Capabilities
2. **Bundle ID:** `ai.benchbook.app`
3. **Build:** Product > Archive
4. **Submit:** Window > Organizer > Distribute App > App Store Connect

#### Signing Requirements
- **Apple Developer Program** membership ($99/year)
- **Distribution Certificate**: created in Apple Developer portal or Xcode
- **Provisioning Profile**: App Store distribution profile for `ai.benchbook.app`
- Xcode manages these automatically when "Automatically manage signing" is enabled

### Android (Google Play)

#### Build
```bash
# Debug APK (for testing)
./scripts/build-android.sh --apk

# Release AAB (for Play Store)
./scripts/build-android.sh --release
```

#### Signing Requirements
- **Upload Keystore**: generate once, store securely:
  ```bash
  keytool -genkey -v -keystore benchbook-upload.keystore \
    -alias benchbook -keyalg RSA -keysize 2048 -validity 10000
  ```
- **Google Play App Signing**: enabled by default for new apps. Google manages the app signing key; you provide the upload key.
- Configure signing in `android/app/build.gradle`:
  ```groovy
  android {
      signingConfigs {
          release {
              storeFile file('benchbook-upload.keystore')
              storePassword System.getenv('KEYSTORE_PASSWORD')
              keyAlias 'benchbook'
              keyPassword System.getenv('KEY_PASSWORD')
          }
      }
      buildTypes {
          release {
              signingConfig signingConfigs.release
          }
      }
  }
  ```

---

## App Store / Play Store Listings

### Required Assets
| Asset | iOS | Android |
|-------|-----|---------|
| App Icon | 1024x1024 PNG (no alpha) | 512x512 PNG |
| Screenshots | 6.7" (1290x2796), 5.5" (1242x2208) | Phone + 7" + 10" tablet |
| Feature Graphic | N/A | 1024x500 PNG |
| Short Description | Subtitle (30 chars) | 80 chars |
| Full Description | 4000 chars | 4000 chars |
| Privacy Policy URL | Required | Required |
| Category | Productivity / Business | Productivity |

### Suggested Listing Copy

**Name:** BenchBook.AI

**Subtitle/Short:** AI Legal Research for Judges

**Description:**
BenchBook.AI is the judicial productivity platform built by a judge, for judges. Research Tennessee juvenile law faster with AI-powered answers citing T.C.A. Title 36 & 37, complete TRJPP rules, and all DCS policies.

Features:
- AI legal research with verified statute citations
- Complete Tennessee Code Annotated (Titles 36 & 37)
- All Tennessee Rules of Juvenile Practice and Procedure
- Department of Children's Services policy library
- County-specific local court rules
- Research session history and pattern analytics
- Secure, private, closed legal universe

**Privacy Policy URL:** https://benchbook.ai/privacy

**Keywords:** legal research, judicial, Tennessee, juvenile court, TCA, statute, judge, bench book

---

## Capacitor Plugins

| Plugin | Purpose | Status |
|--------|---------|--------|
| `@capacitor/splash-screen` | Branded launch screen (amber on dark) | Installed |
| `@capacitor/status-bar` | Match app theme colors | Installed |
| `@capacitor/browser` | Open external links in system browser | Installed |
| `@capacitor/push-notifications` | Push notifications | Post-launch |

---

## Important Notes

- **legal-corpus/ is NOT bundled**: it stays server-side on Cloudflare Workers. The app binary contains only the native shell and Capacitor plugins.
- **Updates are instant**: changing the web app on Cloudflare Pages immediately updates what mobile users see (no app store review needed for content changes).
- **App Store reviews** are only needed for native shell changes (new plugins, SDK updates, etc.).
- **Offline mode** is not supported, the app requires an internet connection to load from the production server.
