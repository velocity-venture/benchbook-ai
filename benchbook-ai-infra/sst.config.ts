/// <reference path="./.sst/platform/config.d.ts" />

/**
 * BenchBook AI - Infrastructure as Code (SST v3)
 * 
 * This configuration defines:
 * 1. S3 Bucket for legal document storage (PDFs + Chunks)
 * 2. Lambda Function for PDF chunking (triggered by S3 events)
 * 3. Environment variables for Pinecone + LangSmith integration
 * 
 * @author BenchBook AI Team
 * @version 1.0.0 - Phase 1 Infrastructure
 */

export default $config({
  app(input) {
    return {
      name: "benchbook-ai",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },

  async run() {
    // =========================================================================
    // SECRETS (from SST Console or .env)
    // =========================================================================
    const secrets = {
      pineconeApiKey: new sst.Secret("PineconeApiKey"),
      pineconeEnvironment: new sst.Secret("PineconeEnvironment"),
      pineconeIndex: new sst.Secret("PineconeIndex"),
      openaiApiKey: new sst.Secret("OpenAIApiKey"),
      langsmithApiKey: new sst.Secret("LangSmithApiKey"),
    };

    // =========================================================================
    // S3 BUCKET: Legal Document Storage
    // =========================================================================
    const documentBucket = new sst.aws.Bucket("BenchBookDocuments", {
      // Enable versioning for audit trail (legal compliance)
      versioning: true,
      
      // CORS for direct browser uploads (admin panel)
      cors: {
        allowHeaders: ["*"],
        allowMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        allowOrigins: ["*"], // Restrict in production
        maxAge: "1 day",
      },

      // Lifecycle rules for cost optimization
      transform: {
        bucket: {
          lifecycleRules: [
            {
              id: "archive-old-versions",
              enabled: true,
              noncurrentVersionExpirations: [
                {
                  days: 90,
                },
              ],
            },
            {
              id: "abort-incomplete-uploads",
              enabled: true,
              abortIncompleteMultipartUploadDays: 7,
            },
          ],
        },
      },
    });

    // =========================================================================
    // LAMBDA: PDF Chunker (Python 3.11)
    // =========================================================================
    const pdfChunker = new sst.aws.Function("PdfChunker", {
      handler: "packages/functions/src/chunker_lambda.handler",
      runtime: "python3.11",
      
      // Memory: 3GB for large PDF processing
      memory: "3 GB",
      
      // Timeout: 5 minutes for complex documents
      timeout: "5 minutes",
      
      // Environment variables
      environment: {
        BUCKET_NAME: documentBucket.name,
        PINECONE_API_KEY: secrets.pineconeApiKey.value,
        PINECONE_ENVIRONMENT: secrets.pineconeEnvironment.value,
        PINECONE_INDEX: secrets.pineconeIndex.value,
        OPENAI_API_KEY: secrets.openaiApiKey.value,
        LANGSMITH_API_KEY: secrets.langsmithApiKey.value,
        LANGCHAIN_TRACING_V2: "true",
        LANGCHAIN_PROJECT: "benchbook-ai-chunker",
        // Prompt versioning for A/B testing
        PROMPT_VERSION: "v1",
      },
      
      // Python dependencies layer
      python: {
        container: true, // Use container for native dependencies
      },
      
      // Permissions
      permissions: [
        {
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket",
          ],
          resources: [
            documentBucket.arn,
            $interpolate`${documentBucket.arn}/*`,
          ],
        },
      ],
      
      // Link to bucket for automatic permissions
      link: [documentBucket],
    });

    // =========================================================================
    // S3 EVENT TRIGGER: Auto-process uploaded PDFs
    // =========================================================================
    documentBucket.subscribe(pdfChunker.arn, {
      events: ["s3:ObjectCreated:*"],
      filterPrefix: "raw/",
      filterSuffix: ".pdf",
    });

    // =========================================================================
    // LAMBDA: LangSmith Evaluation Runner (for Phase 1 testing)
    // =========================================================================
    const evaluationRunner = new sst.aws.Function("EvaluationRunner", {
      handler: "packages/functions/src/evaluation_runner.handler",
      runtime: "python3.11",
      memory: "1 GB",
      timeout: "15 minutes", // Long timeout for 50-query evaluation
      
      environment: {
        PINECONE_API_KEY: secrets.pineconeApiKey.value,
        PINECONE_ENVIRONMENT: secrets.pineconeEnvironment.value,
        PINECONE_INDEX: secrets.pineconeIndex.value,
        OPENAI_API_KEY: secrets.openaiApiKey.value,
        LANGSMITH_API_KEY: secrets.langsmithApiKey.value,
        LANGCHAIN_TRACING_V2: "true",
        LANGCHAIN_PROJECT: "benchbook-ai-evaluation",
        PROMPT_VERSION: "v1",
      },
      
      python: {
        container: true,
      },
      
      link: [documentBucket],
    });

    // =========================================================================
    // API GATEWAY: Evaluation Endpoint (Admin only)
    // =========================================================================
    const api = new sst.aws.ApiGatewayV2("BenchBookApi", {
      cors: {
        allowOrigins: ["*"], // Restrict in production
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    api.route("POST /evaluate", evaluationRunner.arn);
    api.route("GET /health", {
      handler: "packages/functions/src/health.handler",
      runtime: "nodejs22.x",
    });

    // =========================================================================
    // OUTPUTS
    // =========================================================================
    return {
      bucketName: documentBucket.name,
      bucketArn: documentBucket.arn,
      chunkerFunctionName: pdfChunker.name,
      evaluationFunctionName: evaluationRunner.name,
      apiEndpoint: api.url,
      
      // S3 paths for reference
      paths: {
        rawPdfs: "raw/",
        processedChunks: "chunks/",
        embeddings: "embeddings/",
      },
    };
  },
});
