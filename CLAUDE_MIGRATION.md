# Claude API Migration Guide

This document outlines the steps to migrate from OpenAI + Pinecone to Claude Sonnet 4.6 + direct context loading.

## Prerequisites

1. **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com/)
2. **Legal Corpus** - Ensure `legal-corpus/` directory contains TCA, TRJPP, and DCS files
3. **Node.js 18+** - For @anthropic-ai/sdk compatibility

## Migration Steps

### 1. Install Dependencies

```bash
cd app
npm install @anthropic-ai/sdk
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

**Required variables:**
```env
# Core Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
USE_CLAUDE_API=true

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Optional optimization:**
```env
ENABLE_PROMPT_CACHING=true
CORPUS_CACHE_TTL_MINUTES=5
```

### 3. Remove Legacy Dependencies (if present)

```bash
npm uninstall openai @pinecone-database/pinecone
```

### 4. Test the Migration

**Development server:**
```bash
npm run dev
```

**Test API endpoint:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-supabase-token" \
  -d '{"query":"What are the criteria for detention under TCA 37-1-114?"}'
```

### 5. Legal Corpus Verification

Ensure these files exist and are readable:
- `legal-corpus/tca/title-37.html` (Juveniles - 2.2MB)
- `legal-corpus/tca/title-36.html` (Domestic Relations - 5.9MB)  
- `legal-corpus/trjpp/all-rules.txt` (Complete TRJPP rules)
- `legal-corpus/dcs/chap14-*.pdf` (DCS policies)

### 6. Performance Monitoring

The new implementation tracks:
- **Model usage** (Haiku vs Sonnet routing)
- **Token consumption** (input + output)
- **Cache hit rates** (when prompt caching enabled)
- **Processing times** (end-to-end response)

Check logs for:
```
Claude API: Query classified as 'simple' -> Haiku
Claude API: Query classified as 'complex' -> Sonnet
Corpus cache: Refreshed (TTL expired)
Citation verification: Found 3 TCA references
```

## Architecture Changes

### Before (OpenAI + Pinecone)
```
User Query -> Embedding Generation -> Pinecone Search -> GPT-4o -> Response
```
**Cost:** ~$0.05-0.15 per query  
**Latency:** 3-5 seconds  
**Complexity:** Vector embeddings, Pinecone indexing

### After (Claude + Direct Context)
```
User Query -> Complexity Classification -> Corpus Loading -> Claude (Haiku/Sonnet) -> Response
```
**Cost:** $0.02-0.09 per query  
**Latency:** 1-3 seconds  
**Complexity:** Direct file loading, smart routing

## Model Routing Logic

### Haiku 4.5 (Simple Queries - $0.02 avg)
- Direct statute lookups ("What is TCA 37-1-114?")
- Definitions and deadlines
- Short questions < 50 words
- Single legal domain

### Sonnet 4.6 (Complex Queries - $0.09 avg)
- Multi-step analysis ("What factors should I consider?")
- Comparisons between statutes
- Case strategy questions
- Multiple legal domains

## Prompt Caching Benefits

When `ENABLE_PROMPT_CACHING=true`:
- **90% cost reduction** on cached legal corpus
- **Faster responses** - cached context loads instantly
- **Consistent context** - same legal corpus across sessions
- **Auto-refresh** - 5-minute TTL ensures updates

## Troubleshooting

### "Claude API call failed"
- Verify `ANTHROPIC_API_KEY` is correct
- Check API rate limits at console.anthropic.com
- Ensure `USE_CLAUDE_API=true`

### Empty or missing legal corpus
- Verify `legal-corpus/` directory exists
- Check file permissions (readable by Node.js process)
- Monitor corpus cache refresh logs

### High token usage
- Review query complexity classification
- Consider shorter TTL for corpus cache
- Monitor Haiku vs Sonnet routing accuracy

### Slow response times
- Enable prompt caching if disabled
- Check legal corpus file sizes
- Monitor corpus loading performance

## Cost Optimization

### Baseline Targets
- **Solo plan users:** 200 queries/month = $8.20 AI cost (90% margin)
- **Court package users:** 800 queries/month = $38.40 AI cost (83% margin)

### Monitoring Queries
```sql
-- Daily AI cost tracking
SELECT 
  DATE(created_at) as date,
  COUNT(*) as queries,
  AVG(CASE WHEN query_type = 'simple' THEN 0.02 ELSE 0.09 END) as avg_cost
FROM research_queries 
WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at);
```

## Migration Checklist

- [ ] Anthropic API key configured
- [ ] Dependencies installed (`@anthropic-ai/sdk`)
- [ ] Legacy dependencies removed (OpenAI, Pinecone)
- [ ] Environment variables updated
- [ ] Legal corpus accessible
- [ ] Development server running
- [ ] API endpoint tested
- [ ] Query classification working
- [ ] Citation verification active
- [ ] Cost monitoring enabled
- [ ] Performance metrics tracked

## Rollback Plan

If issues occur, revert to the old implementation:

1. Restore `route.old.ts` → `route.ts`
2. Set `USE_CLAUDE_API=false`
3. Reinstall OpenAI/Pinecone dependencies
4. Restore old environment variables
5. Monitor for 24-48 hours before permanent rollback

## Next Steps

After successful migration:
1. Monitor query cost and response quality for 7 days
2. Compare user satisfaction vs old system  
3. Optimize corpus loading for specific query patterns
4. Plan Cloudflare Workers migration (Phase 2)
5. Implement advanced prompt caching strategies