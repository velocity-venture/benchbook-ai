# BenchBook.AI — Launch Checklist

## Supabase (Database)
- [ ] Supabase project created in US East region
- [ ] Migration: `20260204_initial_schema.sql` applied
- [ ] Migration: `20260206_waitlist.sql` applied
- [ ] Migration: `20260209003525_init_chat_persistence.sql` applied
- [ ] Migration: `20260214_research_patterns.sql` applied
- [ ] Migration: `20260404_rate_limiting.sql` applied
- [ ] RLS policies verified (auth required for chat, public insert for waitlist)
- [ ] Seed data loaded (optional, for demo)
- [ ] Email auth configured (SMTP or Supabase default)
- [ ] Supabase URL and anon key saved for deployment

## Web (Cloudflare Pages)
- [ ] Cloudflare account authenticated: `wrangler login`
- [ ] Pages project created: `benchbook-ai`
- [ ] Environment variable set: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Environment variable set: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Environment variable set: `USE_CLAUDE_API=true`
- [ ] Environment variable set: `ENABLE_PROMPT_CACHING=true`
- [ ] Environment variable set: `NODE_VERSION=18`
- [ ] Secret set: `ANTHROPIC_API_KEY` (via `wrangler pages secret put`)
- [ ] Legal corpus pre-built: `node scripts/prebuild-corpus.js`
- [ ] Build succeeds: `cd app && npm run build:cloudflare`
- [ ] Deployed to Cloudflare Pages
- [ ] Site loads at `benchbook-ai.pages.dev`
- [ ] Landing page renders (hero, pricing, waitlist form)
- [ ] Waitlist form submits successfully to Supabase
- [ ] Login/signup flow works
- [ ] Chat API returns streaming responses with citations
- [ ] Citation verification working (verified badges on sources)

## DNS / Domain
- [ ] `benchbook.ai` domain registered
- [ ] DNS managed by Cloudflare (or CNAME pointed to `benchbook-ai.pages.dev`)
- [ ] Custom domain added in Cloudflare Pages settings
- [ ] SSL certificate provisioned (automatic with Cloudflare)
- [ ] `www.benchbook.ai` redirects to `benchbook.ai` (or vice versa)
- [ ] HSTS headers active (configured in next.config.mjs)

## iOS (App Store Connect)
- [ ] Apple Developer Program membership active ($99/year)
- [ ] Bundle ID registered: `ai.benchbook.app`
- [ ] Capacitor synced: `cd app && npx cap sync ios`
- [ ] App icons generated (1024x1024 for App Store)
- [ ] Signing certificate and provisioning profile configured
- [ ] `capacitor.config.ts` server.url set to `https://benchbook.ai`
- [ ] Build succeeds in Xcode
- [ ] Tested on physical device
- [ ] App Store listing created in App Store Connect:
  - [ ] App name: BenchBook.AI
  - [ ] Category: Productivity
  - [ ] Screenshots uploaded (6.7" and 5.5")
  - [ ] Description written
  - [ ] Privacy policy URL set: `https://benchbook.ai/privacy`
  - [ ] Keywords set
- [ ] Archive built and uploaded to App Store Connect
- [ ] Submitted for App Review

## Android (Google Play Console)
- [ ] Google Play Developer account active ($25 one-time)
- [ ] App created in Google Play Console
- [ ] Capacitor synced: `cd app && npx cap sync android`
- [ ] App icons generated (all mipmap densities)
- [ ] Upload keystore generated and stored securely
- [ ] `capacitor.config.ts` server.url set to `https://benchbook.ai`
- [ ] Release AAB built: `./scripts/build-android.sh --release`
- [ ] Tested on physical device
- [ ] Play Store listing created:
  - [ ] App name: BenchBook.AI
  - [ ] Category: Productivity
  - [ ] Screenshots uploaded (phone + tablet)
  - [ ] Feature graphic (1024x500)
  - [ ] Short description (80 chars)
  - [ ] Full description
  - [ ] Privacy policy URL set
- [ ] AAB uploaded to Play Console
- [ ] Submitted for review

## Post-Launch
- [ ] Monitor Cloudflare analytics for traffic
- [ ] Monitor Supabase for waitlist signups
- [ ] Monitor Claude API usage and costs
- [ ] Set up error alerting (Cloudflare notifications or external service)
- [ ] Privacy policy page created at `/privacy`
- [ ] Terms of service page created at `/terms`
- [ ] Support email configured: `support@benchbook.ai`
