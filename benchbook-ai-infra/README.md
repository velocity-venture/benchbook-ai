# BenchBook AI Infrastructure

## Phase 1: Testing Infrastructure & Quality Assurance

This SST (Serverless Stack) project defines the core infrastructure for BenchBook AI's legal document processing and evaluation pipeline.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BenchBook AI Infrastructure                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Upload ────►  S3 Bucket (raw/)                           │
│                          │                                      │
│                          ▼ [S3 Event Trigger]                   │
│                      Lambda: PdfChunker                         │
│                          │                                      │
│                          ├──► OpenAI Embeddings                 │
│                          │                                      │
│                          ▼                                      │
│                      Pinecone Serverless                        │
│                          │                                      │
│                          ▼                                      │
│  API Gateway ────►  Lambda: EvaluationRunner                    │
│      │                   │                                      │
│      │                   ▼                                      │
│      │              LangSmith Tracing                           │
│      │                                                          │
│      └──────────►  Lambda: Health Check                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

1. **Node.js 20+** - [Download](https://nodejs.org/)
2. **AWS CLI** - [Install](https://aws.amazon.com/cli/)
3. **SST CLI** - Installed via npm
4. **Pinecone Account** - [Sign up](https://www.pinecone.io/)
5. **OpenAI API Key** - [Get key](https://platform.openai.com/)
6. **LangSmith Account** - [Sign up](https://smith.langchain.com/)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to infrastructure directory
cd benchbook-ai-infra

# Install dependencies
npm install
```

### 2. Configure AWS Credentials

```bash
# Option A: Use AWS CLI profile
aws configure --profile benchbook

# Option B: Export credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### 3. Set SST Secrets

```bash
# Pinecone
npx sst secret set PineconeApiKey pc-xxxxxxxx
npx sst secret set PineconeEnvironment us-east-1
npx sst secret set PineconeIndex benchbook-legal

# OpenAI
npx sst secret set OpenAIApiKey sk-proj-xxxxxxxx

# LangSmith
npx sst secret set LangSmithApiKey lsv2_pt_xxxxxxxx
```

Or from the repo root:
```bash
PINECONE_API_KEY=pc-... OPENAI_API_KEY=sk-... ./scripts/deploy_infra.sh
```

### 4. Deploy to Development

```bash
# Start development mode (hot reload)
npm run dev

# Or deploy to dev stage
npm run deploy:dev
```

### 5. Deploy to Production

```bash
npm run deploy

# Or from the repo root
SST_STAGE=production ./scripts/deploy_infra.sh
```

---

## 📁 Project Structure

```
benchbook-ai-infra/
├── sst.config.ts              # Infrastructure definition
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment template
│
└── packages/
    └── functions/
        ├── requirements.txt   # Python dependencies
        └── src/
            ├── chunker_lambda.py      # PDF processing
            ├── evaluation_runner.py   # 50-query evaluation
            └── health.ts              # API health check
```

---

## 🔧 Configuration Details

### S3 Bucket Structure

| Folder | Purpose |
|--------|---------|
| `raw/` | Uploaded PDFs (triggers Lambda) |
| `raw/dcs-policies/` | DCS policy documents |
| `raw/local-rules/` | County-specific rules |
| `raw/tca-title-36/` | TN Code Title 36 |
| `raw/tca-title-37/` | TN Code Title 37 |
| `chunks/` | Processed JSON manifests |

### Lambda Functions

| Function | Memory | Timeout | Trigger |
|----------|--------|---------|---------|
| PdfChunker | 3 GB | 5 min | S3 `raw/*.pdf` |
| EvaluationRunner | 1 GB | 15 min | API Gateway |
| Health | 128 MB | 10 sec | API Gateway |

### Pinecone Index Specification

- **Name:** `benchbook-legal`
- **Dimensions:** 3072 (text-embedding-3-large)
- **Metric:** Cosine similarity
- **Cloud:** AWS us-east-1 (Serverless)

---

## 📊 Running Evaluations

### Full 50-Query Suite

```bash
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/evaluate \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Filter by Category

```bash
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/evaluate \
  -H "Content-Type: application/json" \
  -d '{"category": "DCS Policy"}'
```

### Specific Query IDs

```bash
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/evaluate \
  -H "Content-Type: application/json" \
  -d '{"query_ids": [1, 5, 10, 47, 48, 49]}'
```

### Expected Response

```json
{
  "evaluation_id": "eval_20241222_143052",
  "prompt_version": "v1",
  "summary": {
    "total_queries": 50,
    "passed": 47,
    "failed": 3,
    "overall_accuracy": 0.94,
    "avg_citation_accuracy": 0.92,
    "avg_response_time_ms": 1250
  },
  "category_breakdown": {
    "DCS Policy": {"total": 8, "passed": 8, "accuracy": 1.0},
    "Statute": {"total": 15, "passed": 14, "accuracy": 0.93},
    ...
  }
}
```

---

## 📈 LangSmith Dashboard

All traces are tagged with `prompt_version` for A/B testing:

1. Go to [LangSmith](https://smith.langchain.com/)
2. Select project: `benchbook-ai-production`
3. Filter by tag: `v1` or `v2`
4. Compare metrics between versions

### Key Metrics to Monitor

- **Citation Accuracy**: % of responses with correct legal citations
- **Response Time**: Average latency (target: <2s)
- **Retrieval Quality**: Relevance of top-k chunks
- **Safety Compliance**: REFUSE/CLARIFY handling

---

## 🔒 Security Considerations

1. **Secrets Management**: All API keys stored in SST Secrets (encrypted)
2. **IAM Roles**: Least-privilege permissions for Lambda functions
3. **VPC**: Not required for Phase 1 (public Pinecone + OpenAI endpoints)
4. **S3 Encryption**: Server-side encryption enabled by default
5. **No PII Storage**: Legal documents only, no case facts

---

## 🛠️ Troubleshooting

### Lambda Timeout on Large PDFs

```bash
# Increase timeout in sst.config.ts
timeout: "10 minutes"

# Increase memory
memory: "5 GB"
```

### Pinecone Connection Errors

```bash
# Verify API key
npx sst secret list

# Check index exists
curl -X GET "https://api.pinecone.io/indexes" \
  -H "Api-Key: $PINECONE_API_KEY"
```

### LangSmith Traces Not Appearing

```bash
# Verify environment variables
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=benchbook-ai-production

# Check API key
npx sst secret get LangSmithApiKey
```

---

## 📝 Next Steps (Phase 2)

After Phase 1 evaluation passes 95% accuracy:

1. **Voice Input** (Week 3-4)
2. **Dropdown Quick-Select** (Week 3-4)
3. **Personalization** (Week 5-6)
4. **Document Generation** (Week 7-8)
5. **Production Launch** (February 2026)

---

## 📞 Support

- **Repository**: https://github.com/velocity-venture/benchbook-ai
- **SST Docs**: https://sst.dev/
- **LangSmith Docs**: https://docs.smith.langchain.com/

---

**Built with ❤️ for Tennessee Juvenile Court Judges**
