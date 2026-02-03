"""
BenchBook AI - PDF Chunker Lambda Handler
==========================================
Version: 1.0.0 - Phase 1 Infrastructure

This Lambda function:
1. Triggers on S3 PDF uploads to /raw/ folder
2. Extracts text with section detection for legal documents
3. Chunks text with overlap (optimized for RAG)
4. Generates OpenAI embeddings
5. Upserts vectors to Pinecone Serverless
6. Logs all operations to LangSmith for evaluation

Author: BenchBook AI Team
"""

import os
import io
import json
import re
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

import boto3
import structlog
from PyPDF2 import PdfReader
import pdfplumber
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from langsmith import Client as LangSmithClient
from langsmith.run_helpers import traceable
import tiktoken

# =============================================================================
# CONFIGURATION
# =============================================================================

# Environment variables (injected by SST)
BUCKET_NAME = os.environ.get("BUCKET_NAME", "benchbook-ai-docs-2025")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_INDEX = os.environ.get("PINECONE_INDEX", "benchbook-legal")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
LANGSMITH_API_KEY = os.environ.get("LANGSMITH_API_KEY")
PROMPT_VERSION = os.environ.get("PROMPT_VERSION", "v1")

# Chunking parameters (optimized for legal documents)
CHUNK_SIZE = 1000          # Characters per chunk
CHUNK_OVERLAP = 200        # Overlap for context continuity
MIN_CHUNK_SIZE = 100       # Minimum viable chunk
MAX_CHUNKS_PER_DOC = 500   # Safety limit

# Embedding model
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSIONS = 3072

# Initialize structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)
logger = structlog.get_logger()

# Initialize clients
s3_client = boto3.client("s3")
openai_client = OpenAI(api_key=OPENAI_API_KEY)
langsmith_client = LangSmithClient(api_key=LANGSMITH_API_KEY)

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Token counter for accurate chunking
tokenizer = tiktoken.encoding_for_model("gpt-4")


# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class DocumentMetadata:
    """Metadata for legal documents in BenchBook AI corpus."""
    source: str              # DCS|LOCAL|TRJPP|TCA36|TCA37
    title: str               # Document title
    section_id: str          # Section identifier (e.g., "37-1-117")
    url: Optional[str]       # Source URL if available
    version_date: str        # Last update date
    county: Optional[str]    # For local rules
    file_key: str            # S3 key
    page_number: int         # Page in PDF
    chunk_index: int         # Chunk position
    total_chunks: int        # Total chunks in document


@dataclass
class Chunk:
    """A text chunk ready for embedding."""
    id: str                  # Unique chunk ID
    text: str                # Chunk content
    metadata: DocumentMetadata
    token_count: int         # Tokens in chunk
    embedding: Optional[List[float]] = None


# =============================================================================
# LEGAL DOCUMENT PARSING
# =============================================================================

def detect_document_source(file_key: str) -> str:
    """
    Detect the legal source type from S3 path.
    
    Args:
        file_key: S3 object key (e.g., "raw/dcs-policies/14.12.pdf")
    
    Returns:
        Source identifier: DCS|LOCAL|TRJPP|TCA36|TCA37
    """
    key_lower = file_key.lower()
    
    if "dcs" in key_lower or "policy" in key_lower:
        return "DCS"
    elif "local" in key_lower or "tipton" in key_lower:
        return "LOCAL"
    elif "trjpp" in key_lower or "juvenile-practice" in key_lower:
        return "TRJPP"
    elif "title36" in key_lower or "title-36" in key_lower:
        return "TCA36"
    elif "title37" in key_lower or "title-37" in key_lower:
        return "TCA37"
    else:
        return "UNKNOWN"


def extract_section_id(text: str, source: str) -> str:
    """
    Extract legal section identifiers from text.
    
    Patterns:
    - TCA: "§ 37-1-117" or "T.C.A. § 36-1-102"
    - DCS: "Policy 14.12" or "§14.26"
    - TRJPP: "Rule 206" or "TRJPP 4(c)"
    - Local: "Rule 4.16" or "Local Rule 2.05"
    """
    patterns = {
        "TCA36": r"(?:T\.?C\.?A\.?\s*)?§?\s*36-\d+-\d+(?:\([a-z]\))?",
        "TCA37": r"(?:T\.?C\.?A\.?\s*)?§?\s*37-\d+-\d+(?:\([a-z]\))?",
        "DCS": r"(?:DCS\s*)?(?:Policy\s*)?§?\s*\d+\.\d+",
        "TRJPP": r"(?:TRJPP\s*)?Rule\s*\d+(?:\([a-z]\))?",
        "LOCAL": r"(?:Local\s*)?Rule\s*\d+\.\d+",
    }
    
    pattern = patterns.get(source, r"§?\s*\d+[\.-]\d+")
    match = re.search(pattern, text, re.IGNORECASE)
    
    return match.group(0).strip() if match else "UNKNOWN"


def extract_title(text: str, file_key: str) -> str:
    """Extract document title from first lines or filename."""
    # Try to find title in first 500 characters
    first_section = text[:500]
    
    # Common title patterns
    title_patterns = [
        r"^(.+?)\n",                          # First line
        r"CHAPTER\s+\d+[:\s]+(.+?)\n",        # Chapter heading
        r"RULE\s+\d+[:\s]+(.+?)\n",           # Rule heading
        r"POLICY\s+[\d.]+[:\s]+(.+?)\n",      # Policy heading
    ]
    
    for pattern in title_patterns:
        match = re.search(pattern, first_section, re.IGNORECASE)
        if match:
            title = match.group(1).strip()
            if len(title) > 10 and len(title) < 200:
                return title
    
    # Fallback to filename
    filename = os.path.basename(file_key)
    return filename.replace(".pdf", "").replace("_", " ").title()


# =============================================================================
# TEXT EXTRACTION
# =============================================================================

@traceable(name="extract_pdf_text", tags=["pdf", "extraction", PROMPT_VERSION])
def extract_pdf_text(pdf_content: bytes) -> tuple[str, List[Dict[str, Any]]]:
    """
    Extract text from PDF with page-level metadata.
    
    Uses pdfplumber for better table and layout handling.
    Falls back to PyPDF2 if pdfplumber fails.
    
    Args:
        pdf_content: Raw PDF bytes
    
    Returns:
        Tuple of (full_text, page_metadata_list)
    """
    pages_data = []
    full_text = ""
    
    try:
        # Primary: pdfplumber (better for legal docs with tables)
        with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                
                # Extract tables separately
                tables = page.extract_tables()
                table_text = ""
                for table in tables:
                    for row in table:
                        if row:
                            table_text += " | ".join(str(cell) for cell in row if cell) + "\n"
                
                combined_text = page_text + "\n" + table_text
                
                pages_data.append({
                    "page_number": i + 1,
                    "text": combined_text,
                    "char_count": len(combined_text),
                })
                
                full_text += combined_text + "\n\n"
                
    except Exception as e:
        logger.warning("pdfplumber_failed", error=str(e))
        
        # Fallback: PyPDF2
        reader = PdfReader(io.BytesIO(pdf_content))
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            
            pages_data.append({
                "page_number": i + 1,
                "text": page_text,
                "char_count": len(page_text),
            })
            
            full_text += page_text + "\n\n"
    
    logger.info(
        "pdf_extracted",
        total_pages=len(pages_data),
        total_chars=len(full_text),
    )
    
    return full_text, pages_data


# =============================================================================
# CHUNKING
# =============================================================================

@traceable(name="chunk_text", tags=["chunking", PROMPT_VERSION])
def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks optimized for RAG retrieval.
    
    Strategy:
    1. Prefer splitting at paragraph boundaries
    2. Fall back to sentence boundaries
    3. Last resort: character boundary with word preservation
    
    Args:
        text: Full document text
        chunk_size: Target characters per chunk
        overlap: Character overlap between chunks
    
    Returns:
        List of chunk dictionaries with text and position info
    """
    chunks = []
    
    # Clean text
    text = re.sub(r'\s+', ' ', text).strip()
    
    if not text:
        return chunks
    
    # Split into paragraphs first
    paragraphs = re.split(r'\n\s*\n', text)
    
    current_chunk = ""
    chunk_start = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # If adding this paragraph exceeds chunk size
        if len(current_chunk) + len(para) + 1 > chunk_size:
            # Save current chunk if it meets minimum
            if len(current_chunk) >= MIN_CHUNK_SIZE:
                chunks.append({
                    "text": current_chunk.strip(),
                    "start_char": chunk_start,
                    "end_char": chunk_start + len(current_chunk),
                    "token_count": len(tokenizer.encode(current_chunk)),
                })
            
            # Start new chunk with overlap
            if overlap > 0 and current_chunk:
                # Take last `overlap` characters
                overlap_text = current_chunk[-overlap:].strip()
                current_chunk = overlap_text + " " + para
            else:
                current_chunk = para
            
            chunk_start = chunk_start + len(current_chunk) - len(para) - 1
        else:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
    
    # Don't forget the last chunk
    if current_chunk and len(current_chunk) >= MIN_CHUNK_SIZE:
        chunks.append({
            "text": current_chunk.strip(),
            "start_char": chunk_start,
            "end_char": chunk_start + len(current_chunk),
            "token_count": len(tokenizer.encode(current_chunk)),
        })
    
    # Safety limit
    if len(chunks) > MAX_CHUNKS_PER_DOC:
        logger.warning(
            "chunk_limit_exceeded",
            total_chunks=len(chunks),
            limit=MAX_CHUNKS_PER_DOC,
        )
        chunks = chunks[:MAX_CHUNKS_PER_DOC]
    
    logger.info(
        "text_chunked",
        num_chunks=len(chunks),
        avg_chunk_size=sum(len(c["text"]) for c in chunks) / len(chunks) if chunks else 0,
    )
    
    return chunks


# =============================================================================
# EMBEDDINGS
# =============================================================================

@traceable(name="generate_embeddings", tags=["embeddings", "openai", PROMPT_VERSION])
def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings using OpenAI text-embedding-3-large.
    
    Processes in batches of 100 to respect API limits.
    
    Args:
        texts: List of text strings to embed
    
    Returns:
        List of embedding vectors (3072 dimensions each)
    """
    embeddings = []
    batch_size = 100
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        
        response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=batch,
            dimensions=EMBEDDING_DIMENSIONS,
        )
        
        batch_embeddings = [item.embedding for item in response.data]
        embeddings.extend(batch_embeddings)
        
        logger.info(
            "embeddings_batch_complete",
            batch_start=i,
            batch_size=len(batch),
            total_processed=len(embeddings),
        )
    
    return embeddings


# =============================================================================
# PINECONE OPERATIONS
# =============================================================================

def ensure_pinecone_index() -> Any:
    """
    Ensure Pinecone index exists, create if not.
    
    Returns:
        Pinecone Index instance
    """
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    
    if PINECONE_INDEX not in existing_indexes:
        logger.info("creating_pinecone_index", index_name=PINECONE_INDEX)
        
        pc.create_index(
            name=PINECONE_INDEX,
            dimension=EMBEDDING_DIMENSIONS,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1",
            ),
        )
    
    return pc.Index(PINECONE_INDEX)


@traceable(name="upsert_to_pinecone", tags=["pinecone", "upsert", PROMPT_VERSION])
def upsert_to_pinecone(chunks: List[Chunk]) -> Dict[str, Any]:
    """
    Upsert chunk vectors to Pinecone.
    
    Args:
        chunks: List of Chunk objects with embeddings
    
    Returns:
        Upsert statistics
    """
    index = ensure_pinecone_index()
    
    vectors = []
    for chunk in chunks:
        if chunk.embedding is None:
            continue
        
        vectors.append({
            "id": chunk.id,
            "values": chunk.embedding,
            "metadata": {
                "text": chunk.text[:1000],  # Pinecone metadata limit
                "source": chunk.metadata.source,
                "title": chunk.metadata.title,
                "section_id": chunk.metadata.section_id,
                "page_number": chunk.metadata.page_number,
                "chunk_index": chunk.metadata.chunk_index,
                "version_date": chunk.metadata.version_date,
                "file_key": chunk.metadata.file_key,
                "county": chunk.metadata.county or "",
                "prompt_version": PROMPT_VERSION,
            },
        })
    
    # Upsert in batches of 100
    batch_size = 100
    total_upserted = 0
    
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch)
        total_upserted += len(batch)
        
        logger.info(
            "pinecone_batch_upserted",
            batch_start=i,
            batch_size=len(batch),
            total_upserted=total_upserted,
        )
    
    return {
        "total_vectors": len(vectors),
        "index_name": PINECONE_INDEX,
    }


# =============================================================================
# MAIN HANDLER
# =============================================================================

@traceable(
    name="pdf_chunker_handler",
    run_type="chain",
    tags=["lambda", "s3-trigger", PROMPT_VERSION],
)
def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler triggered by S3 PDF uploads.
    
    Workflow:
    1. Download PDF from S3
    2. Extract text with page metadata
    3. Detect document source type
    4. Chunk text with overlap
    5. Generate embeddings
    6. Upsert to Pinecone
    7. Save chunk manifest to S3
    
    Args:
        event: S3 event notification
        context: Lambda context
    
    Returns:
        Processing result summary
    """
    start_time = datetime.utcnow()
    
    try:
        # Parse S3 event
        record = event["Records"][0]
        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]
        
        logger.info(
            "processing_started",
            bucket=bucket,
            key=key,
            prompt_version=PROMPT_VERSION,
        )
        
        # Download PDF
        response = s3_client.get_object(Bucket=bucket, Key=key)
        pdf_content = response["Body"].read()
        file_size = len(pdf_content)
        
        logger.info("pdf_downloaded", file_size=file_size)
        
        # Extract text
        full_text, pages_data = extract_pdf_text(pdf_content)
        
        if not full_text.strip():
            logger.warning("empty_pdf", key=key)
            return {
                "statusCode": 200,
                "body": json.dumps({"message": "PDF is empty or unreadable"}),
            }
        
        # Detect source and extract metadata
        source = detect_document_source(key)
        title = extract_title(full_text, key)
        section_id = extract_section_id(full_text, source)
        version_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Detect county for local rules
        county = None
        if source == "LOCAL":
            if "tipton" in key.lower():
                county = "Tipton"
        
        logger.info(
            "document_metadata",
            source=source,
            title=title,
            section_id=section_id,
            county=county,
        )
        
        # Chunk text
        raw_chunks = chunk_text(full_text)
        
        # Build Chunk objects with metadata
        chunks: List[Chunk] = []
        for i, raw_chunk in enumerate(raw_chunks):
            chunk_id = hashlib.sha256(
                f"{key}:{i}:{raw_chunk['text'][:100]}".encode()
            ).hexdigest()[:16]
            
            metadata = DocumentMetadata(
                source=source,
                title=title,
                section_id=section_id,
                url=None,
                version_date=version_date,
                county=county,
                file_key=key,
                page_number=1,  # TODO: Map chunks to pages
                chunk_index=i,
                total_chunks=len(raw_chunks),
            )
            
            chunks.append(Chunk(
                id=f"{source.lower()}_{chunk_id}",
                text=raw_chunk["text"],
                metadata=metadata,
                token_count=raw_chunk["token_count"],
            ))
        
        # Generate embeddings
        texts = [chunk.text for chunk in chunks]
        embeddings = generate_embeddings(texts)
        
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embedding = embedding
        
        # Upsert to Pinecone
        pinecone_result = upsert_to_pinecone(chunks)
        
        # Save chunk manifest to S3
        manifest = {
            "source_key": key,
            "source": source,
            "title": title,
            "section_id": section_id,
            "processed_at": datetime.utcnow().isoformat(),
            "prompt_version": PROMPT_VERSION,
            "stats": {
                "file_size_bytes": file_size,
                "total_pages": len(pages_data),
                "total_chunks": len(chunks),
                "total_tokens": sum(c.token_count for c in chunks),
            },
            "chunks": [
                {
                    "id": c.id,
                    "text_preview": c.text[:200],
                    "token_count": c.token_count,
                }
                for c in chunks
            ],
        }
        
        manifest_key = key.replace("raw/", "chunks/").replace(".pdf", "_manifest.json")
        s3_client.put_object(
            Bucket=bucket,
            Key=manifest_key,
            Body=json.dumps(manifest, indent=2),
            ContentType="application/json",
        )
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        result = {
            "statusCode": 200,
            "body": json.dumps({
                "message": "PDF processed successfully",
                "source_key": key,
                "manifest_key": manifest_key,
                "chunks_created": len(chunks),
                "vectors_upserted": pinecone_result["total_vectors"],
                "processing_time_seconds": processing_time,
                "prompt_version": PROMPT_VERSION,
            }),
        }
        
        logger.info(
            "processing_complete",
            chunks_created=len(chunks),
            processing_time=processing_time,
            prompt_version=PROMPT_VERSION,
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "processing_failed",
            error=str(e),
            error_type=type(e).__name__,
        )
        
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e),
                "error_type": type(e).__name__,
            }),
        }


# =============================================================================
# LOCAL TESTING
# =============================================================================

if __name__ == "__main__":
    # Test event for local development
    test_event = {
        "Records": [
            {
                "s3": {
                    "bucket": {"name": "benchbook-ai-docs-2025"},
                    "object": {"key": "raw/dcs-policies/14.12.pdf"},
                }
            }
        ]
    }
    
    result = handler(test_event, None)
    print(json.dumps(result, indent=2))
