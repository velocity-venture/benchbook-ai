# BenchBook.AI Architecture — Claude Migration

## Current State (OpenAI + Pinecone RAG)

### Backend Architecture
- **LLM:** OpenAI GPT-4o (`gpt-4o`) via OpenAI API
- **Vector Search:** Pinecone vector database with `text-embedding-3-large` (3072 dimensions)
- **Fallback:** Local search server on port 8765 (if Pinecone unavailable)
- **Rate Limiting:** In-memory per-user limits (20 requests/minute)
- **Auth:** Supabase auth with RLS policies
- **Persistence:** Supabase tables: `research_queries`, `chat_sessions`, `chat_messages`, `chat_feedback`

### Legal Corpus Structure
```
legal-corpus/
├── tca/
│   ├── title-36.html    # Domestic Relations (5.9MB)
│   └── title-37.html    # Juveniles (2.2MB)
├── trjpp/
│   ├── rule-*.txt       # Individual rules
│   └── all-rules.txt    # Complete rules compilation
├── dcs/
│   └── chap14-*.pdf     # DCS policy chapters (25+ PDFs)
└── local-rules/         # Court-specific rules
```

### Current Limitations
- **Vector search complexity:** Embedding generation + Pinecone queries add latency
- **Cost per query:** ~$0.05-0.15 (embedding + GPT-4o + Pinecone operations)
- **Context window:** Limited by vector search relevance scoring
- **Maintenance:** Pinecone indexing pipeline, embedding updates

## Target State (Claude Sonnet 4.6 + Direct Context Loading)

### New Architecture Strategy

#### 1. Smart Model Routing
- **Simple lookups/definitions** → **Claude Haiku 4.5** ($1/$5 per MTok)
- **Complex analysis/multi-step reasoning** → **Claude Sonnet 4.6** ($3/$15 per MTok)
- **Classification criteria:**
  - Query length < 50 words AND contains specific statute/rule reference → Haiku
  - Query contains "analyze", "compare", "what factors", "how should I" → Sonnet
  - Multiple legal domains or complex scenarios → Sonnet

#### 2. Direct Context Loading
- **1M token window:** Load entire relevant legal corpus sections directly
- **No vector search:** Eliminate embedding generation and Pinecone queries
- **Structured loading:** Organize legal text by priority (TCA > TRJPP > DCS > Local)

#### 3. Prompt Caching Implementation
- **Cache legal corpus** at 90% discount using Anthropic's prompt caching
- **Cache structure:**
  ```typescript
  const legalCorpusCache = {
    systemPrompt: "You are BenchBook AI...",
    tcaTitle36: "...",  // Cached
    tcaTitle37: "...",  // Cached  
    trjppRules: "...",  // Cached
    dcsRelevant: "...", // Cached (query-specific)
  }
  ```
- **Cache invalidation:** 5-minute TTL, refresh daily for corpus updates

#### 4. Citation Verification Layer
- **Post-processing:** Verify all statute citations exist in loaded corpus
- **Format standardization:** Convert to consistent citation format (e.g., "T.C.A. § 37-1-114")
- **Dead link detection:** Flag references to repealed/amended statutes

## Implementation Plan

### Phase 1: Core Migration
1. Replace OpenAI SDK with `@anthropic-ai/sdk`
2. Implement corpus loading functions for each legal domain
3. Build query classification for Haiku vs Sonnet routing
4. Remove Pinecone dependencies

### Phase 2: Optimization
1. Implement prompt caching with corpus pre-loading
2. Add citation verification post-processing
3. Performance monitoring and cost tracking
4. A/B testing vs current system

### Phase 3: Enhancement
1. Legal corpus auto-updates (TCA amendments, new DCS policies)
2. Advanced query understanding (intent classification)
3. Multi-turn conversation optimization
4. Export to Cloudflare Workers

## Cost Model Analysis

### Target Cost Per Query

| Query Type | Model | Input Tokens | Output Tokens | Base Cost | With Cache | Target |
|------------|-------|--------------|---------------|-----------|------------|--------|
| Simple lookup | Haiku 4.5 | 25K | 200 | $0.020 | $0.007 | $0.02 |
| Complex analysis | Sonnet 4.6 | 50K | 800 | $0.240 | $0.087 | $0.09 |

### Monthly Cost Projections (Per User)

**Solo Plan ($79/month):**
- 200 queries/month: 70% simple ($0.02), 30% complex ($0.09)
- AI cost: (140 × $0.02) + (60 × $0.09) = $8.20/month
- **Margin: 90%** ($79 - $8.20 = $70.80)

**Court Package ($229/month):**
- 800 queries/month: 60% simple, 40% complex  
- AI cost: (480 × $0.02) + (320 × $0.09) = $38.40/month
- **Margin: 83%** ($229 - $38.40 = $190.60)

### Savings vs Current OpenAI+Pinecone
- **Eliminate Pinecone:** $70+/month hosting cost removed
- **Reduce per-query cost:** From $0.05-0.15 to $0.02-0.09 (40-60% reduction)
- **Faster responses:** No embedding/vector search latency (~300ms saved)

## Technical Implementation Details

### Environment Variables
```bash
# Remove these:
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_HOST=...

# Add these:
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_HAIKU_MODEL=claude-haiku-4.5
CLAUDE_SONNET_MODEL=claude-sonnet-4.6
ENABLE_PROMPT_CACHING=true
CORPUS_CACHE_TTL_MINUTES=5
```

### Corpus Loading Strategy
1. **On-demand loading:** Load legal sections based on query classification
2. **Memory management:** Stream large files, limit concurrent loads
3. **Preprocessing:** Clean HTML, extract pure legal text, standardize formatting
4. **Intelligent chunking:** Respect statute boundaries, maintain context

### Response Format
```typescript
interface ClaudeResponse {
  response: string;           // Main AI response
  sources: Source[];          // Verified citations
  model_used: 'haiku' | 'sonnet';
  tokens_used: number;
  cache_hit: boolean;
  processing_time_ms: number;
}
```

## Deployment Strategy

### Development Phase
1. **Parallel implementation:** New Claude route alongside existing OpenAI route
2. **Feature flag:** `USE_CLAUDE_API=true/false` environment variable
3. **A/B testing:** Compare response quality and user satisfaction

### Production Migration
1. **Soft launch:** Opt-in beta for select users
2. **Monitor metrics:** Response quality, latency, cost per query
3. **Full cutover:** Replace OpenAI route with Claude implementation
4. **Cleanup:** Remove OpenAI/Pinecone dependencies after 30-day monitoring period

### Cloudflare Workers Migration (Post-Claude)
- Compatible with `@anthropic-ai/sdk` via Workers AI
- Edge deployment for reduced latency (especially TN region)
- Cost optimization through Cloudflare's AI pricing tier
- Simplified scaling without Vercel/Next.js limitations

## Success Metrics

### Performance Targets
- **Response time:** < 2 seconds (vs current 3-5 seconds)
- **Cost reduction:** 40-60% lower per-query cost
- **Accuracy:** Equal or better citation accuracy vs GPT-4o
- **User satisfaction:** 90%+ preference in blind testing

### Monitoring Dashboard
- Query classification accuracy (Haiku vs Sonnet routing)
- Cache hit rates and token savings
- Cost per query tracking by plan type
- Citation verification success rate
- Model performance comparison metrics