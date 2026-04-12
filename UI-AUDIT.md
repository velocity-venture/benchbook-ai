# UI/UX Audit: BenchBook.AI Frontend

**Auditor:** Claude Opus 4.6
**Date:** April 8, 2026
**Branch:** `main` (post-merge of `remediation/overnight-2026-04-07`)
**Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix/shadcn primitives

---

## Design System Overview

**Two distinct visual themes coexist in this codebase:**

| Property | Landing Page (`page.tsx`) | Dashboard (all `(dashboard)/` pages) |
|----------|--------------------------|---------------------------------------|
| Background | Off-white (`#FAF9F6`) | Dark slate (`slate-950`) |
| Text | `slate-900` | White / `slate-400` |
| Brand color | Terracotta `#B85C38` | Amber `amber-500` / `amber-400` |
| Fonts | Georgia serif (headings), Inter (body) | Inter only |
| Border style | `slate-200` light borders | `slate-800` dark borders |
| Card style | White with light borders | `slate-900` with `slate-800` borders |

The landing page uses a warm, professional aesthetic aimed at first-impression credibility. The dashboard uses a dark theme suited for long research sessions and courtroom use.

**Icon library:** Lucide React (consistent throughout)
**UI primitives:** Radix UI via shadcn (`Badge`, `Button`, `Card`, `Input`, `Textarea`, `Dialog`, `Tabs`, `Tooltip`, `Avatar`, `DropdownMenu`, `Slot`)

---

## Screen-by-Screen Audit

### 1. Landing Page (`src/app/page.tsx`)

**What the judge sees:**
- Sticky header with "B" logo (terracotta square), nav links (Pricing, About), Sign In button
- Hero section: large serif headline "Your Bench. Your Brain. Amplified." with two CTAs (Join Waitlist, Start Free Trial)
- Demo query card on the right showing a sample question and response about termination of parental rights
- Problem statement section with three statistics (127 cases, 3.2hrs research, 40+ statute changes)
- Bento grid of 5 feature cards: AI Research Assistant (2-col), Case Pattern Analysis, Smart Statute Browser, Judicial Document Drafting (2-col)
- "What's Inside" section: three cards showing TCA, TRJPP, DCS corpus coverage with "ALL" badges
- "Closed legal universe" tagline with lock icon
- "Built from the bench" section with Judge M.O. Eckel III quote and bio
- Pricing: Solo ($79/mo) and Court Package ($229/mo, "Most Popular" badge) with feature lists
- Waitlist form with email input and submit states (idle/loading/success/duplicate/error)
- Schedule Demo CTA (mailto link)
- Footer: 4-column layout with logo, Platform links, Connect links, copyright

**Actions available:**
- Sign In (links to `/login`)
- Join Waitlist / Start Free Trial
- Scroll to sections via anchor links (#pricing, #about, #waitlist, #features)
- Submit waitlist email (writes to Supabase `waitlist` table)
- Schedule Demo (opens email client)

**Visual quality:**
- Fade-in scroll animations via `IntersectionObserver` (`useInView` hook)
- Subtle background blur circles (3% opacity)
- Card hover effects (`-translate-y-0.5`, shadow-lg)
- Waitlist button changes color on success (green) and error (red)
- Well-spaced sections with consistent `py-20` padding

**Mobile responsiveness:**
- Two-column hero collapses to single column (`lg:grid-cols-2`)
- Pricing cards collapse to single column (`md:grid-cols-2`)
- Waitlist form stacks vertically (`sm:flex-row`)
- Pricing/About nav links hidden on small screens (`hidden sm:block`)
- Footer columns collapse (`md:grid-cols-4`)

**Issues:**
- None found. This is a polished, production-ready landing page.

---

### 2. Login Page (`src/app/login/page.tsx`)

**What the judge sees:**
- Centered card on dark slate-950 background
- Amber scale icon with "BenchBook AI" branding
- Toggle between Sign In and Sign Up modes
- Sign Up adds a "Full Name" field
- Email input (placeholder: "judge@tncourts.gov")
- Password input
- Error display in red banner
- Loading spinner during authentication
- Footer: "Secure access for Tennessee Juvenile Court personnel only"

**Actions:**
- Sign in or sign up via Supabase email/password
- Toggle between sign-in/sign-up modes
- Navigate back to landing page via logo link

**Issues:**
- No "Forgot Password" flow — judge locked out if password forgotten
- No OAuth options (Google, Microsoft) — many court systems use Microsoft 365
- Password minimum length is 6 characters — may want to enforce stronger requirements for judicial accounts

---

### 3. Onboarding (`src/app/(dashboard)/onboarding/page.tsx`)

**What the judge sees:**
- Centered form on dark background
- Amber scale icon with "Welcome to BenchBook AI" heading
- Four fields:
  - Full Name (text input, required, placeholder: "Hon. Jane Smith")
  - County (dropdown of all 95 Tennessee counties, required)
  - Court Type (dropdown: General Sessions, Juvenile, Combined, required)
  - Title (dropdown: Judge, Magistrate, Referee, defaults to "Judge")
- Error message display
- "Complete Setup" button (amber)

**Actions:**
- Fill profile and save to Supabase `profiles` table
- Redirects to `/dashboard` on success

**Visual quality:**
- Clean, focused form with consistent styling
- Required field indicators (red asterisks)
- Dropdowns use native `<select>` styled to match the dark theme
- Ring focus states with amber accent

**Issues:**
- Native `<select>` dropdowns look different across browsers — the 95-county dropdown may be unwieldy on mobile without a searchable combobox
- No way to skip onboarding — judge must fill all required fields
- No validation feedback beyond the generic error message

---

### 4. Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

**What the judge sees:**
- Full-height flex layout: sidebar on left, main content on right
- `bg-slate-950` background
- Server-side auth check — redirects to `/login` if not authenticated
- Fetches profile data for sidebar user info

**Architecture notes:**
- Uses edge runtime
- Wrapped in `PreferencesProvider` for theme/accessibility settings
- Imports `courtroom-mode.css` globally

---

### 5. Sidebar (`src/components/sidebar.tsx`)

**What the judge sees:**
- Left-rail navigation, `w-64` (collapsible to `w-16`)
- Logo: amber square with scale icon + "BenchBook AI" text
- Navigation items (top to bottom):
  1. Home (`/dashboard`) — Home icon
  2. Research (`/chat`) — MessageSquare icon
  3. TN Code (`/tca`) — BookOpen icon
  4. TRJPP Rules (`/trjpp`) — Scale icon
  5. DCS Policies (`/dcs-policies`) — FileText icon
  6. Settings (`/settings`) — Settings icon
- Active state: amber background tint, amber text, amber border
- Inactive state: slate-400 text, hover to white with slate-800 bg
- Bottom section:
  - Collapse toggle (ChevronLeft/Right)
  - User info card: avatar circle (amber, initials), name, county/email
  - Sign Out button (red text)

**Actions:**
- Navigate between all 6 main sections
- Collapse/expand sidebar
- Sign out

**Visual quality:**
- Smooth 300ms transition on collapse
- User avatar with initials derived from name
- Clean iconography
- Good hover states

**Mobile responsiveness:**
- Sidebar has no mobile drawer/hamburger — it's always rendered
- **Issue:** On mobile, the sidebar takes permanent space. The chat page handles this with its own show/hide sidebar, but other pages (dashboard, TCA, TRJPP, DCS, settings) don't — the sidebar will compress content on narrow screens.

---

### 6. Dashboard Home (`src/app/(dashboard)/dashboard/page.tsx`)

**What the judge sees:**
- Header: "Welcome, {userName}" with current date, "New Research Session" button
- Recent Research section: list of up to 5 recent chat sessions with relative timestamps ("Today", "Yesterday", "3 days ago"), hover highlights
- Research Patterns component (see below)
- Quick Start: 6 pre-written query cards in a 3-column grid (Detention Grounds, TPR Standard, Detention Hearing Timeline, Delinquent Dispositions, DCS Abuse Response, Discovery Rules)
- Browse the Corpus: 3 cards linking to TCA, TRJPP, DCS browsers with section counts

**Actions:**
- Start new research session
- Click a recent session to resume
- Click a quick start query (pre-fills chat)
- Browse corpus sections
- Refresh research patterns

**Loading state:**
- Full-screen spinner (`Loader2 animate-spin`) while fetching data

**Research Patterns component (`src/components/research-patterns.tsx`):**
- Two-column layout: "Most Searched Questions" and "Most Accessed Legal Sources"
- Each item shows count badge and last-used timestamp
- Clickable items navigate to chat or document viewer
- Refresh button with spinning icon
- Tips section with amber accent
- Skeleton loading animation (pulse rectangles)
- Empty states: italic placeholder text

**Issues:**
- Research patterns click navigation uses `window.location.href = '/dashboard/chat?q=...'` but the chat page is at `/chat`, not `/dashboard/chat` — **broken navigation link**
- Similarly, citation clicks go to `/dashboard/${docType}?section=...` which doesn't match actual routes (`/tca`, `/trjpp`, etc.) — **broken navigation links**

---

### 7. Chat UI (`src/app/(dashboard)/chat/page.tsx`) — Core Product

**What the judge sees:**

**Session sidebar (left, w-72):**
- "New Research" button at top
- List of past sessions with titles (truncated)
- Active session: amber highlight
- Hover reveals trash icon for deletion
- Empty state: "No research sessions yet"
- Mobile: slides in/out via toggle, hidden by default (`lg:translate-x-0`)

**Header bar:**
- Sparkles icon + "AI Legal Research" title
- Subtitle: "T.C.A., DCS Policy, Case Law, TRJPP"
- Bench Cards toggle button (Gavel icon)
- "TN Juvenile Law" badge
- Mobile: ChevronLeft button toggles session sidebar

**Bench Cards panel (toggled):**
- 4-column grid of categorized quick queries:
  - Detention (3 queries)
  - Sentencing & Disposition (3 queries)
  - DCS & Removal (3 queries)
  - Procedure (3 queries)
- Each query is a clickable button that populates the input and closes the panel

**Empty state (no messages):**
- Large amber scale icon
- "Ask anything about Tennessee Juvenile Law" heading
- Description text mentioning all corpus sources
- 5 suggested queries in a 2-column grid
- Source indicators: TCA (blue), DCS (green), Case Law (purple), TRJPP (orange)

**Message thread:**

*User messages:*
- Right-aligned amber bubbles with rounded corners (rounded-tr-sm for chat tail effect)
- White text on amber background

*Assistant messages:*
- Left-aligned with amber scale avatar icon
- Dark card (slate-900 border, rounded-tl-sm)
- Markdown rendering via `ReactMarkdown` with `prose-invert` styling
- **Sources section** (when citations present):
  - "Sources" label with BookOpen icon
  - "All verified" indicator (green ShieldCheck) when all sources verified
  - Each source: colored Badge by type (TCA=blue, DCS=green, CASELAW=purple, TRJPP=orange, LOCAL=cyan)
  - Citation text with optional "(unverified)" yellow label
  - Truncated snippet text
- **Confidence badge** (below sources):
  - HIGH: green ShieldCheck icon, "HIGH Confidence" + reason
  - MEDIUM: yellow AlertTriangle icon, "MEDIUM Confidence" + reason
  - LOW: red ShieldAlert icon, "LOW Confidence" + reason
- **Warnings** (below confidence):
  - Yellow text on yellow-tinted background for each warning
- **Action buttons** (below message):
  - Copy (strips markdown, shows green checkmark for 2s)
  - Bookmark (amber when active)
  - Thumbs up (green when active)
  - Thumbs down (red when active)
  - Timestamp (right-aligned, clock icon)

**Streaming states:**
- While streaming: same message layout but content progressively fills in
- Before streaming starts: three bouncing amber dots with "Researching Tennessee law..." text

**Input area (bottom):**
- Fixed footer with backdrop blur
- Textarea (auto-height, min 56px, max 200px)
- Send button (icon, disabled when empty or loading)
- Enter to submit, Shift+Enter for newline
- Disclaimer: "AI can make mistakes. Always verify legal citations."

**Issues found:**
- **Voice input not integrated:** The `VoiceInput` and `VoiceEnabledInput` components exist in `src/components/voice-input.tsx` but are **not imported or used anywhere in the chat page**. The voice preference toggle exists in settings, but enabling it does nothing in chat. The component checks `window.__benchbook_voice_enabled` but the chat page never reads this value.
- **Client-side fallback extraction:** `extractSourcesFromResponse()` at line 956 falls back to client-side regex if the backend doesn't return sources — but this regex uses `T\.C\.A\.?` which doesn't match "Tenn. Code Ann." (same gap that was fixed server-side). This fallback pattern should be updated to match.
- **No "scroll to bottom" button:** When the user scrolls up to review earlier messages and a new response comes in, auto-scroll fires but there's no manual "scroll to bottom" indicator.

---

### 8. TCA Browser (`src/app/(dashboard)/tca/page.tsx`)

**What the judge sees:**
- Header: "Tennessee Code Annotated" with section count and "Reference Only" badge
- Search bar with magnifying glass icon and clear button
- Quick search chips: detention, 37-1-114, transfer, TPR, disposition, custody, DCS, appeal
- Default view: "Key Sections" (10 featured sections in 2-column grid) + "Browse by Title" (3 groups: Title 37, Title 36, Rules) + External Resources (4 links)
- Search view: filtered results with count
- Browse view: sections filtered by title group

**Each section card:**
- Blue badge with section number (e.g., "T.C.A. § 37-1-114")
- Chapter label in small text
- Title and description
- Expandable: shows summary text and clickable tag pills
- Copy button (copies citation text, green checkmark feedback)
- Chevron expand/collapse toggle

**External resources:** Lexis Tennessee Code, TN Courts Self-Help, DCS Policies, TRJPP Rules — open in new tabs

**Issues:**
- No pagination — all sections render at once. With a large corpus this could be slow, though the current dataset is manageable.
- Tag pills set the search query but don't scroll to the search bar — user may not notice the search has changed.

---

### 9. TRJPP Browser (`src/app/(dashboard)/trjpp/page.tsx`)

**Structure:** Nearly identical to TCA browser but organized by Parts (1-4) instead of Titles. Same search, expand/collapse, copy, and browse patterns.

---

### 10. DCS Policies Browser (`src/app/(dashboard)/dcs-policies/page.tsx`)

**Structure:** Nearly identical to TCA/TRJPP browsers but organized by Chapters (9, 14, 16). Same UX patterns.

---

### 11. Settings (`src/app/(dashboard)/settings/page.tsx`)

**What the judge sees:**
- Three tabs: Profile, Security, Appearance
- **Profile tab:** Full Name, Title (dropdown), County, Organization, Email, Phone — with Save button
- **Security tab:** "Not yet configured" placeholder for 2FA/MFA — no functional security settings
- **Appearance tab:** Theme selector (Dark, Light, System), Courtroom Mode toggle, Large Fonts toggle, Reduced Motion toggle, Voice-to-Text toggle

**Actions:**
- Edit and save profile fields
- Toggle appearance preferences (persisted to Supabase via `PreferencesProvider`)
- Sign Out (at bottom of page, uses Supabase signOut)

**Issues:**
- Security tab shows "Not yet configured" — this is a placeholder with no functionality
- Light theme and System theme options exist in the UI but the root layout hardcodes `className="dark"` and `bg-slate-950` — selecting Light or System theme will have no visible effect. The theme data attribute is set on the document root but there are no light-mode CSS rules.

---

### 12. Error Page (`src/app/(dashboard)/error.tsx`)

**What the judge sees:**
- Centered error display with red AlertTriangle icon
- "Something went wrong" heading
- Generic error message with "Try Again" button

Well-implemented error boundary with proper `reset()` integration.

---

## Cross-Cutting Audit Items

### Confidence Badges and Citation Indicators

**Status: IMPLEMENTED**

- Confidence badges render correctly for HIGH (green shield), MEDIUM (yellow triangle), LOW (red shield alert)
- Citation source badges are color-coded by type (TCA=blue, DCS=green, CASELAW=purple, TRJPP=orange, LOCAL=cyan)
- "All verified" indicator shows when every citation checks out
- Unverified citations show "(unverified)" label in yellow
- Warning messages display in yellow-tinted boxes below the confidence badge
- All data flows from the backend via SSE events (`confidence`, `sources`)

### Bench Cards Panel

**Status: IMPLEMENTED**

- Toggle button in chat header ("Bench Cards" with Gavel icon)
- 4 categories: Detention, Sentencing & Disposition, DCS & Removal, Procedure
- 12 total pre-written queries, 3 per category
- Click populates input and closes panel
- Responsive: 4-col on desktop, 2-col on tablet, 1-col on mobile

### Voice Input Integration

**Status: COMPONENT EXISTS, NOT WIRED UP**

- `VoiceInput` component (`src/components/voice-input.tsx`) is fully implemented with:
  - Web Speech API integration
  - Recording indicator (red pulsing dot)
  - Interim transcript display
  - Auto-submit on sentence-ending punctuation
- `VoiceEnabledInput` wrapper exists
- Settings has a Voice-to-Text toggle that sets `window.__benchbook_voice_enabled`
- **But:** The chat page does not import `VoiceInput` or `VoiceEnabledInput`. Enabling voice in settings has no effect. This feature is built but not connected.

### Mobile Responsiveness

**Tailwind breakpoint usage:**

| Page | Breakpoints Used | Mobile Behavior |
|------|-----------------|-----------------|
| Landing | `sm:`, `md:`, `lg:` | Good — hero stacks, pricing stacks, nav collapses |
| Login | None needed | Good — centered card, max-w-md |
| Onboarding | None needed | Good — centered card, max-w-lg |
| Dashboard | `md:`, `sm:`, `lg:` | Good — grids collapse |
| Chat | `sm:`, `lg:` | Good — sidebar drawer, grid collapses |
| TCA/TRJPP/DCS | `md:` | Adequate — grids collapse to single column |
| Settings | `md:` | Adequate |

**Issue:** The main sidebar (not the chat session sidebar) does not have a mobile drawer. On screens narrower than ~300px with the sidebar expanded, content will be squeezed. On `w-16` (collapsed), this is manageable but the collapse toggle requires the user to find it. No hamburger menu exists in the dashboard layout.

### Courtroom Mode

**Status: CSS EXISTS, PARTIALLY CONNECTED**

The `courtroom-mode.css` file provides:
- Enlarged touch targets (48px min buttons, 48px inputs)
- Larger fonts (18px base, scaled headings)
- Enhanced focus outlines (amber)
- Reduced motion support
- Mobile bottom actions positioning
- Tablet-specific grid optimizations

The `PreferencesProvider` applies CSS classes to `<html>` based on settings. However, many of the CSS selectors target class names (`.chat-message`, `.chat-container`, `.chat-input`, `.chat-send-button`, `.sidebar-nav`, `.clickable`, `.mobile-bottom-actions`, `.search-result`, `.citation-badge`, `.document-content`, `.document-section`) that **do not exist in the actual component JSX**. The courtroom mode CSS was written with placeholder class names rather than the actual Tailwind classes used in components. This means courtroom mode partially works (the `button` and `input` element selectors will apply) but the component-specific optimizations won't.

### Placeholder Text, TODOs, and Incomplete Sections

| Location | Finding |
|----------|---------|
| `settings/page.tsx:329` | Security tab: "Not yet configured" — placeholder, no 2FA functionality |
| `hallucination-guard.ts:70` | System prompt: "case law lookup is not yet available" — accurate, case law is not in corpus |
| Theme settings | Light/System theme options exist but have no CSS implementation — dark mode is hardcoded |

No `TODO` or `FIXME` comments found in any component files.

### Loading States and Error Handling

| Component | Loading State | Error Handling |
|-----------|--------------|----------------|
| Dashboard | Spinner (Loader2) | None explicit — relies on error boundary |
| Chat | Bouncing dots + "Researching..." | Error message in chat thread |
| Chat streaming | Progressive markdown render | Graceful fallback on malformed JSON |
| Research Patterns | Skeleton pulse animation | Console error, silent fail |
| TCA/TRJPP/DCS | None (client-side data) | None needed (static data) |
| Settings | Loading state during save | None shown to user |
| Login | Spinner on button | Red error banner |
| Onboarding | "Saving..." button text | Red error text |
| Error boundary | N/A | AlertTriangle + Try Again button |

---

## Summary of Issues

### High Priority
1. **Voice input not connected** — Component built and settings toggle exists, but never imported into chat page. Feature is non-functional.
2. **Broken navigation links in Research Patterns** — Top queries link to `/dashboard/chat?q=...` (should be `/chat?q=...`). Citation links go to `/dashboard/${docType}?section=...` (should be `/${docType}?section=...`).
3. **Client-side citation fallback missing "Tenn. Code Ann." format** — `extractSourcesFromResponse()` in chat page (line 961) only matches `T.C.A.` prefix, not the `Tenn. Code Ann.` variant that was fixed server-side.

### Medium Priority
4. **Light/System theme toggle does nothing** — Root layout hardcodes dark mode. Settings show the option but selecting Light or System has no visible effect.
5. **Courtroom mode CSS selectors don't match JSX** — Custom class names in `courtroom-mode.css` (`.chat-message`, `.sidebar-nav`, etc.) are never applied in components. Only generic element selectors (`button`, `input`) will work.
6. **Main sidebar has no mobile drawer** — No hamburger menu or slide-in behavior for the primary navigation sidebar on small screens.
7. **Security settings placeholder** — Tab exists with "Not yet configured" text and no functionality.

### Low Priority
8. **No "Forgot Password" flow** on login page
9. **Native `<select>` dropdowns** on onboarding could be replaced with searchable combobox (95 counties is unwieldy on mobile)
10. **No pagination** on TCA/TRJPP/DCS browsers (acceptable at current data size)
11. **No "scroll to bottom" button** in chat when scrolled up during streaming
12. **Tag pill clicks in TCA browser** don't scroll to search bar

---

## Recommendations

1. **Wire up voice input** — Import `VoiceEnabledInput` in `chat/page.tsx`, wrap the textarea, and read the voice preference from the context. The component is ready; this is ~10 lines of integration code.
2. **Fix Research Patterns navigation** — Change `/dashboard/chat?q=` to `/chat?q=` and `/dashboard/${docType}` to `/${docType}` in `research-patterns.tsx`.
3. **Update client-side citation regex** — Mirror the server-side fix: change `T\.C\.A\.?` to `(?:T\.C\.A\.?|Tenn\.?\s*Code\s*Ann\.?)` in `extractSourcesFromResponse()`.
4. **Remove or disable Light/System theme options** until light mode CSS is implemented. Showing non-functional options erodes trust.
5. **Add courtroom mode data attributes or class names** to actual JSX elements so the CSS rules apply.
6. **Add mobile hamburger menu** to the dashboard layout for the main sidebar.
