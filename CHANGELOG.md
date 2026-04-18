# Changelog: BenchBook.AI

All notable changes. Newest first.

## 2026-04-18

- **feat:** Extract 25 DCS policy PDFs to text; corpus grows from 5.9MB to 6.5MB (537KB DCS policies now indexed)
- **chore:** Resolve all pre-existing lint warnings (SpeechRecognition types, any removal, unused params)
- **docs:** TCA stub files updated with acquisition instructions and General Sessions priority sections
- **chore:** Add deploy and preview scripts to app/package.json

## 2026-04-12

- **fix:** Auth flow; remove mock chat fallback; add error handling

## 2026-04-08

- **fix:** Citation regex and smart routing gaps per morning review
- **merge:** remediation/overnight-2026-04-07 into main

## 2026-04-07 (Overnight Session)

- **security:** Audit secrets, harden .gitignore
- **feat:** Rebuild citation validation with real corpus cross-referencing (16 tests)
- **feat:** Hallucination prevention guard: confidence scoring (HIGH/MEDIUM/LOW), citation warnings
- **refine:** Smart routing tightened (complex queries always hit Sonnet 4.6)
- **docs:** Document corpus contents, add expansion stubs, dynamic file loading
- **ui:** Copy button, citation highlights, confidence badges, Bench Cards panel
- **chore:** Fix deps, resolve build errors, pass all 31 tests
- **docs:** Rewrite README and ARCHITECTURE to reflect current state

## 2026-04-04

- **feat:** Edge runtime compatibility for Cloudflare Pages deploy
- **feat:** Legal pages (privacy, terms)
- **feat:** Pre-built corpus (legal-corpus-data.json) for Cloudflare edge
- **feat:** Cloudflare Pages deployment pipeline
- **feat:** Polished landing page with waitlist signup
- **feat:** Capacitor native shell for iOS and Android

## 2026-03-31

- **feat:** Streaming responses, prompt caching, onboarding flow, model updates, pricing fix

## 2026-03-27

- **feat:** Migrate from OpenAI + Pinecone to Claude Sonnet 4.6 with direct context loading

## 2026-02-14

- **feat:** Personal Research Patterns: tracks judicial query patterns and adapts suggestions
- **feat:** Bench-optimized UI enhancements (large font mode, voice input, reduced motion)

## 2026-02-09

- **refactor:** Strip case management; refocus exclusively as AI legal research tool

## 2026-02-08

- **feat:** RAG ingestion pipeline and full TRJPP legal corpus
- **feat:** Local vector search server and 3-tier search fallback
- **feat:** Demo seed data for TN Judicial Conference
- **feat:** DCS title extraction, deduplication
- **fix:** Replace dangerouslySetInnerHTML with react-markdown

## 2026-02-05

- **feat:** Clickable cases, 7-day docket, document links in dashboard
