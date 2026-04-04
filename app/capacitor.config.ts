import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.benchbook.app',
  appName: 'BenchBook.AI',
  webDir: 'out',

  // Live server mode: WebView loads from the production Cloudflare URL.
  // No static export needed — API routes stay server-side on Cloudflare Workers.
  // For local development, change server.url to http://localhost:3000
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://benchbook.ai',
    cleartext: false, // HTTPS only in production
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#D4A574',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK', // light text on dark background
      backgroundColor: '#1a1a2e',
    },
  },

  ios: {
    scheme: 'BenchBook.AI',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },

  android: {
    backgroundColor: '#1a1a2e',
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
