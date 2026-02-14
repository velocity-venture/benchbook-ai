#!/usr/bin/env python3
"""
BenchBook AI - Local Document Ingestion Script
================================================
Processes legal documents from local filesystem into embeddings
ready for Pinecone vector database.

Supports: HTML (TCA titles), TXT (TRJPP rules), PDF (DCS policies)

Two modes:
  --prepare   Extract text, chunk, save JSON (no API keys needed)
  --embed     Generate OpenAI embeddings + optionally upsert to Pinecone

Usage:
  python scripts/ingest_local.py --prepare
  python scripts/ingest_local.py --embed
  python scripts/ingest_local.py --embed --pinecone

Author: BenchBook AI / Velocity Venture Holdings
"""

import os
import re
import sys
import json
import hashlib
import argparse
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Optional
from html.parser import HTMLParser

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).parent.parent
CORPUS_DIR = PROJECT_ROOT / "legal-corpus"
OUTPUT_DIR = PROJECT_ROOT / "legal-corpus" / "_processed"

CHUNK_SIZE = 1500       # characters per chunk (target)
CHUNK_OVERLAP = 200     # overlap for context continuity
MIN_CHUNK_SIZE = 100    # minimum viable chunk
MAX_CHUNKS_PER_DOC = 2000
MAX_CHUNK_CHARS = 20000 # ~5000 tokens, safely under 8192 embedding limit

EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSIONS = 3072

# Document source directories map to source types
SOURCE_MAP = {
    "tca/title-36": "TCA36",
    "tca/title-37": "TCA37",
    "trjpp": "TRJPP",
    "dcs": "DCS",
    "local-rules": "LOCAL",
}

# Env files (app first, then root)
ENV_PATHS = [
    PROJECT_ROOT / "app" / ".env.local",
    PROJECT_ROOT / ".env.local",
]


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

@dataclass
class ChunkRecord:
    id: str
    text: str
    source: str           # DCS|LOCAL|TRJPP|TCA36|TCA37
    title: str
    section_id: str
    file_path: str
    chunk_index: int
    total_chunks: int
    token_count: int
    version_date: str
    embedding: Optional[list] = None


# ---------------------------------------------------------------------------
# Env Helpers
# ---------------------------------------------------------------------------

def load_env_value(key: str) -> str:
    """Load a single env var from app/.env.local or .env.local (first wins)."""
    if os.environ.get(key):
        return os.environ[key]
    for path in ENV_PATHS:
        if not path.exists():
            continue
        for line in path.read_text().splitlines():
            if not line or line.startswith("#"):
                continue
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1].strip()
    return ""


# ---------------------------------------------------------------------------
# HTML Text Extraction (for TCA titles from Archive.org)
# ---------------------------------------------------------------------------

class TCAHTMLSectionParser(HTMLParser):
    """Parse TCA HTML into legal sections keyed by citation ID."""

    def __init__(self):
        super().__init__()
        self.sections: list[dict] = []  # [{id, title, text}]
        self._current_section = None
        self._current_text = []
        self._skip = False
        self._skip_tags = {"script", "style", "head", "meta", "link"}
        self._in_heading = False
        self._heading_text = []

    def handle_starttag(self, tag, attrs):
        if tag in self._skip_tags:
            self._skip = True
            return
        attrs_dict = dict(attrs)
        # h3 tags with IDs like t37c01s37-1-101 are section headers
        if tag == "h3" and "id" in attrs_dict:
            # Save previous section
            if self._current_section:
                self._current_section["text"] = " ".join(self._current_text).strip()
                if self._current_section["text"]:
                    self.sections.append(self._current_section)
            # Extract section ID from the h3 id attribute
            raw_id = attrs_dict["id"]
            # e.g. t37c01s37-1-101 -> 37-1-101
            section_match = re.search(r"(\d+-\d+-\d+)", raw_id)
            section_id = section_match.group(1) if section_match else raw_id
            self._current_section = {"id": section_id, "title": "", "text": ""}
            self._current_text = []
            self._in_heading = True
            self._heading_text = []
        elif tag == "h2" and "id" in attrs_dict:
            # Chapter headers - save as section breaks
            if self._current_section:
                self._current_section["text"] = " ".join(self._current_text).strip()
                if self._current_section["text"]:
                    self.sections.append(self._current_section)
            self._current_section = {"id": attrs_dict["id"], "title": "", "text": ""}
            self._current_text = []
            self._in_heading = True
            self._heading_text = []
        elif tag in ("p", "div", "br", "li", "tr"):
            self._current_text.append("\n")

    def handle_endtag(self, tag):
        if tag in self._skip_tags:
            self._skip = False
        if tag in ("h3", "h2") and self._in_heading:
            self._in_heading = False
            if self._current_section:
                self._current_section["title"] = " ".join(self._heading_text).strip()

    def handle_data(self, data):
        if self._skip:
            return
        if self._in_heading:
            self._heading_text.append(data.strip())
        if self._current_section is not None:
            self._current_text.append(data)

    def finalize(self):
        if self._current_section:
            self._current_section["text"] = " ".join(self._current_text).strip()
            if self._current_section["text"]:
                self.sections.append(self._current_section)


class HTMLTextExtractor(HTMLParser):
    """Extract visible text from HTML, stripping tags."""

    def __init__(self):
        super().__init__()
        self.result = []
        self._skip = False
        self._skip_tags = {"script", "style", "head", "meta", "link"}

    def handle_starttag(self, tag, attrs):
        if tag in self._skip_tags:
            self._skip = True

    def handle_endtag(self, tag):
        if tag in self._skip_tags:
            self._skip = False
        if tag in ("p", "div", "br", "h1", "h2", "h3", "h4", "li", "tr"):
            self.result.append("\n")

    def handle_data(self, data):
        if not self._skip:
            self.result.append(data)

    def get_text(self):
        return "".join(self.result)


def extract_tca_sections(filepath: Path) -> list[dict]:
    """Extract TCA HTML into per-section chunks with citation IDs."""
    raw = filepath.read_text(encoding="utf-8", errors="replace")
    parser = TCAHTMLSectionParser()
    parser.feed(raw)
    parser.finalize()
    return parser.sections


def extract_html_text(filepath: Path) -> str:
    """Extract text from an HTML file."""
    raw = filepath.read_text(encoding="utf-8", errors="replace")
    parser = HTMLTextExtractor()
    parser.feed(raw)
    return parser.get_text()


def extract_text(filepath: Path) -> str:
    """Extract text from any supported file format."""
    suffix = filepath.suffix.lower()
    if suffix in (".html", ".htm"):
        return extract_html_text(filepath)
    elif suffix == ".txt":
        return filepath.read_text(encoding="utf-8", errors="replace")
    elif suffix == ".pdf":
        return extract_pdf_text(filepath)
    else:
        print(f"  [SKIP] Unsupported format: {filepath}")
        return ""


def extract_pdf_text(filepath: Path) -> str:
    """Extract text from PDF using pdfplumber (fallback to PyPDF2)."""
    try:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            pages = []
            for page in pdf.pages:
                text = page.extract_text() or ""
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row:
                            text += "\n" + " | ".join(str(c) for c in row if c)
                pages.append(text)
            return "\n\n".join(pages)
    except ImportError:
        pass

    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(str(filepath))
        return "\n\n".join(p.extract_text() or "" for p in reader.pages)
    except ImportError:
        print(f"  [ERROR] No PDF library available. Install pdfplumber or PyPDF2.")
        return ""


# ---------------------------------------------------------------------------
# Detect document source from path
# ---------------------------------------------------------------------------

def detect_source(filepath: Path) -> str:
    """Detect legal source type from file path."""
    rel = str(filepath.relative_to(CORPUS_DIR)).lower()
    for pattern, source in SOURCE_MAP.items():
        if pattern in rel:
            return source
    # Fallback heuristics
    name = filepath.name.lower()
    if "title-36" in name or "title36" in name:
        return "TCA36"
    if "title-37" in name or "title37" in name:
        return "TCA37"
    if "trjpp" in name or "rule" in name:
        return "TRJPP"
    if "dcs" in name or "policy" in name:
        return "DCS"
    return "UNKNOWN"


def extract_section_id(text: str, source: str) -> str:
    """Extract legal section identifiers from text."""
    patterns = {
        "TCA36": r"(?:T\.?C\.?A\.?\s*)?§?\s*36-\d+-\d+(?:\([a-z]\))?",
        "TCA37": r"(?:T\.?C\.?A\.?\s*)?§?\s*37-\d+-\d+(?:\([a-z]\))?",
        "DCS": r"(?:DCS\s*)?(?:Policy\s*)?§?\s*\d+\.\d+",
        "TRJPP": r"(?:TRJPP\s*)?Rule\s*\d+(?:\([a-z]\))?",
        "LOCAL": r"(?:Local\s*)?Rule\s*\d+\.\d+",
    }
    pattern = patterns.get(source, r"§?\s*\d+[\.-]\d+")
    match = re.search(pattern, text[:2000], re.IGNORECASE)
    return match.group(0).strip() if match else "GENERAL"


def extract_title(text: str, filepath: Path) -> str:
    """Extract document title from text or filename."""
    first = text[:800]
    # DCS PDFs: look for "Subject: ..." line
    m = re.search(r"Subject:\s*(.+?)(?:\n|$)", first, re.IGNORECASE)
    if m:
        title = m.group(1).strip()
        if len(title) > 5:
            return f"DCS Policy: {title}"
    for pat in [r"CHAPTER\s+\d+[:\s]+(.+?)\n",
                r"RULE\s+\d+[:\s]+(.+?)\n", r"POLICY\s+[\d.]+[:\s]+(.+?)\n",
                r"^(.+?)\n"]:
        m = re.search(pat, first, re.IGNORECASE)
        if m:
            title = m.group(1).strip()
            if 10 < len(title) < 200:
                return title
    return filepath.stem.replace("-", " ").replace("_", " ").title()


# ---------------------------------------------------------------------------
# Chunking (reuses logic from chunker_lambda.py)
# ---------------------------------------------------------------------------

def count_tokens(text: str) -> int:
    """Approximate token count (4 chars per token heuristic)."""
    return len(text) // 4


def chunk_text(text: str) -> list[dict]:
    """Split text into overlapping chunks optimized for RAG retrieval."""
    if not text or not text.strip():
        return []

    # Normalize paragraph breaks, then split
    text = re.sub(r"\n{3,}", "\n\n", text)  # Collapse 3+ newlines to 2
    paragraphs = re.split(r"\n\s*\n", text)

    # If no paragraph breaks found (e.g., collapsed PDF text), split on sentences
    if len(paragraphs) <= 1 and len(text) > CHUNK_SIZE:
        # Split on sentence boundaries
        sentences = re.split(r"(?<=[.!?])\s+", text)
        paragraphs = sentences

    chunks = []
    current = ""
    chunk_start = 0

    for para in paragraphs:
        para = re.sub(r"\s+", " ", para).strip()  # Clean inline whitespace per paragraph
        if not para:
            continue
        if len(current) + len(para) + 1 > CHUNK_SIZE:
            if len(current) >= MIN_CHUNK_SIZE:
                chunks.append({
                    "text": current.strip(),
                    "start_char": chunk_start,
                    "end_char": chunk_start + len(current),
                    "token_count": count_tokens(current),
                })
            if CHUNK_OVERLAP > 0 and current:
                overlap_text = current[-CHUNK_OVERLAP:].strip()
                current = overlap_text + " " + para
            else:
                current = para
            chunk_start = chunk_start + len(current) - len(para) - 1
        else:
            current = (current + " " + para) if current else para

    if current and len(current) >= MIN_CHUNK_SIZE:
        chunks.append({
            "text": current.strip(),
            "start_char": chunk_start,
            "end_char": chunk_start + len(current),
            "token_count": count_tokens(current),
        })

    return chunks[:MAX_CHUNKS_PER_DOC]


# ---------------------------------------------------------------------------
# Embedding Generation
# ---------------------------------------------------------------------------

def generate_embeddings(texts: list[str], api_key: str) -> list[list[float]]:
    """Generate embeddings using OpenAI text-embedding-3-large.

    Uses dynamic batching to stay under 300K token limit per request.
    """
    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    MAX_TOKENS_PER_BATCH = 250_000  # Safety margin under 300K limit
    MAX_ITEMS_PER_BATCH = 100
    embeddings = []
    batch = []
    batch_tokens = 0
    batch_num = 0

    def flush_batch():
        nonlocal batch, batch_tokens, batch_num
        if not batch:
            return
        batch_num += 1
        print(f"  Embedding batch {batch_num} ({len(batch)} chunks, ~{batch_tokens:,} tokens)...")
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=batch,
            dimensions=EMBEDDING_DIMENSIONS,
        )
        embeddings.extend([item.embedding for item in response.data])
        batch = []
        batch_tokens = 0

    for text in texts:
        # Truncate individual texts to stay under 8192 token embedding limit
        if len(text) > MAX_CHUNK_CHARS:
            text = text[:MAX_CHUNK_CHARS]
        text_tokens = len(text) // 4  # Approximate
        if text_tokens > MAX_TOKENS_PER_BATCH:
            text = text[:MAX_TOKENS_PER_BATCH * 4]
            text_tokens = MAX_TOKENS_PER_BATCH
        # Flush if adding this would exceed limits
        if (batch_tokens + text_tokens > MAX_TOKENS_PER_BATCH or
                len(batch) >= MAX_ITEMS_PER_BATCH):
            flush_batch()
        batch.append(text)
        batch_tokens += text_tokens

    flush_batch()  # Don't forget the last batch
    return embeddings


# ---------------------------------------------------------------------------
# Pinecone Upload
# ---------------------------------------------------------------------------

def upload_to_pinecone(chunks: list[ChunkRecord], api_key: str, index_name: str = "benchbook-legal"):
    """Upsert chunk embeddings to Pinecone."""
    from pinecone import Pinecone, ServerlessSpec

    pc = Pinecone(api_key=api_key)

    existing = [idx.name for idx in pc.list_indexes()]
    if index_name not in existing:
        print(f"  Creating Pinecone index '{index_name}'...")
        pc.create_index(
            name=index_name,
            dimension=EMBEDDING_DIMENSIONS,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    index = pc.Index(index_name)
    vectors = []

    for chunk in chunks:
        if chunk.embedding is None:
            continue
        vectors.append({
            "id": chunk.id,
            "values": chunk.embedding,
            "metadata": {
                "text": chunk.text[:1000],
                "source": chunk.source,
                "title": chunk.title,
                "section_id": chunk.section_id,
                "chunk_index": chunk.chunk_index,
                "version_date": chunk.version_date,
                "file_path": chunk.file_path,
            },
        })

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch)
        print(f"  Upserted batch {i // batch_size + 1} ({len(batch)} vectors)")

    print(f"  Total vectors upserted: {len(vectors)}")


# ---------------------------------------------------------------------------
# Main Pipeline
# ---------------------------------------------------------------------------

def discover_documents() -> list[Path]:
    """Find all legal documents in the corpus directory."""
    docs = []
    for ext in ("*.html", "*.htm", "*.txt", "*.pdf"):
        docs.extend(CORPUS_DIR.rglob(ext))
    # Exclude processed directory and hidden files
    docs = [d for d in docs if "_processed" not in str(d) and not d.name.startswith(".")]
    return sorted(docs)


def prepare_tca(doc: Path, source: str) -> list[ChunkRecord]:
    """Prepare a TCA HTML file using section-aware parsing."""
    sections = extract_tca_sections(doc)
    print(f"  Extracted {len(sections)} legal sections")

    version_date = datetime.utcnow().strftime("%Y-%m-%d")
    all_chunks = []
    chunk_idx = 0

    for sec in sections:
        sec_text = sec["text"]
        if len(sec_text.strip()) < MIN_CHUNK_SIZE:
            continue

        # Always use chunk_text to split — ensures we stay under embedding limits
        header = f"§ {sec['id']} — {sec['title']}"
        sub_chunks = chunk_text(sec_text)
        if not sub_chunks:
            continue

        for j, sc in enumerate(sub_chunks):
            part_label = f" (part {j+1}/{len(sub_chunks)})" if len(sub_chunks) > 1 else ""
            chunk_text_final = f"{header}{part_label}\n\n{sc['text']}".strip()
            # Enforce hard limit for embedding model
            if len(chunk_text_final) > MAX_CHUNK_CHARS:
                chunk_text_final = chunk_text_final[:MAX_CHUNK_CHARS]

            chunk_id = hashlib.sha256(
                f"{doc.name}:{sec['id']}:{j}:{sc['text'][:100]}".encode()
            ).hexdigest()[:16]

            all_chunks.append(ChunkRecord(
                id=f"{source.lower()}_{chunk_id}",
                text=chunk_text_final,
                source=source,
                title=sec["title"] or f"§ {sec['id']}",
                section_id=sec["id"],
                file_path=str(doc.relative_to(CORPUS_DIR)),
                chunk_index=chunk_idx,
                total_chunks=0,
                token_count=count_tokens(chunk_text_final),
                version_date=version_date,
            ))
            chunk_idx += 1

    # Update total_chunks
    for c in all_chunks:
        c.total_chunks = len(all_chunks)

    return all_chunks


def prepare(docs: list[Path]) -> list[ChunkRecord]:
    """Extract and chunk all documents. Returns list of ChunkRecords."""
    all_chunks = []

    for doc in docs:
        print(f"\n[PREPARE] {doc.relative_to(CORPUS_DIR)}")
        source = detect_source(doc)

        # TCA HTML files get section-aware parsing
        if source in ("TCA36", "TCA37") and doc.suffix.lower() in (".html", ".htm"):
            chunks = prepare_tca(doc, source)
            all_chunks.extend(chunks)
            print(f"  Source: {source} | Chunks: {len(chunks)}")
            continue

        text = extract_text(doc)
        if not text or len(text.strip()) < 50:
            print(f"  [SKIP] Empty or too short")
            continue

        title = extract_title(text, doc)
        section_id = extract_section_id(text, source)
        version_date = datetime.utcnow().strftime("%Y-%m-%d")

        raw_chunks = chunk_text(text)
        print(f"  Source: {source} | Title: {title[:60]} | Chunks: {len(raw_chunks)}")

        for i, rc in enumerate(raw_chunks):
            chunk_id = hashlib.sha256(
                f"{doc.name}:{i}:{rc['text'][:100]}".encode()
            ).hexdigest()[:16]

            all_chunks.append(ChunkRecord(
                id=f"{source.lower()}_{chunk_id}",
                text=rc["text"],
                source=source,
                title=title,
                section_id=section_id,
                file_path=str(doc.relative_to(CORPUS_DIR)),
                chunk_index=i,
                total_chunks=len(raw_chunks),
                token_count=rc["token_count"],
                version_date=version_date,
            ))

    return all_chunks


def save_chunks(chunks: list[ChunkRecord], filename: str = "chunks.json"):
    """Save chunks to JSON (without embeddings)."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / filename

    data = []
    for c in chunks:
        d = asdict(c)
        d.pop("embedding", None)  # Don't save empty embeddings
        data.append(d)

    out_path.write_text(json.dumps(data, indent=2))
    print(f"\nSaved {len(data)} chunks to {out_path}")
    return out_path


def save_chunks_with_embeddings(chunks: list[ChunkRecord], filename: str = "chunks_embedded.json"):
    """Save chunks with embeddings to JSON."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / filename

    data = [asdict(c) for c in chunks]
    out_path.write_text(json.dumps(data))
    print(f"\nSaved {len(data)} embedded chunks to {out_path}")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="BenchBook AI Local Document Ingestion")
    parser.add_argument("--prepare", action="store_true", help="Extract and chunk documents (no API keys needed)")
    parser.add_argument("--embed", action="store_true", help="Generate OpenAI embeddings for chunks")
    parser.add_argument("--pinecone", action="store_true", help="Upload embeddings to Pinecone")
    parser.add_argument("--stats", action="store_true", help="Show corpus statistics")
    args = parser.parse_args()

    if not any([args.prepare, args.embed, args.pinecone, args.stats]):
        args.prepare = True  # Default to prepare mode

    # Discover documents
    docs = discover_documents()
    print(f"Found {len(docs)} documents in {CORPUS_DIR}")
    for d in docs:
        print(f"  - {d.relative_to(CORPUS_DIR)} ({d.stat().st_size:,} bytes)")

    if args.stats:
        return

    if args.prepare:
        chunks = prepare(docs)
        save_chunks(chunks)
        print(f"\n{'='*60}")
        print(f"PREPARE COMPLETE")
        print(f"  Documents: {len(docs)}")
        print(f"  Chunks: {len(chunks)}")
        print(f"  Est. tokens: {sum(c.token_count for c in chunks):,}")
        by_source = {}
        for c in chunks:
            by_source[c.source] = by_source.get(c.source, 0) + 1
        for src, count in sorted(by_source.items()):
            print(f"  {src}: {count} chunks")
        print(f"{'='*60}")

    if args.embed:
        # Load chunks from prepare step
        chunks_path = OUTPUT_DIR / "chunks.json"
        if not chunks_path.exists():
            print("No chunks.json found. Run --prepare first.")
            sys.exit(1)

        data = json.loads(chunks_path.read_text())
        chunks = [ChunkRecord(**d, embedding=None) for d in data]
        print(f"\nLoaded {len(chunks)} chunks for embedding")

        api_key = load_env_value("OPENAI_API_KEY")
        if not api_key:
            print("OPENAI_API_KEY not found. Set it in .env.local or environment.")
            sys.exit(1)

        texts = [c.text for c in chunks]
        embeddings = generate_embeddings(texts, api_key)

        for chunk, emb in zip(chunks, embeddings):
            chunk.embedding = emb

        save_chunks_with_embeddings(chunks)
        print(f"\nEmbedding complete: {len(embeddings)} vectors generated")

    if args.pinecone:
        embedded_path = OUTPUT_DIR / "chunks_embedded.json"
        if not embedded_path.exists():
            print("No chunks_embedded.json found. Run --embed first.")
            sys.exit(1)

        data = json.loads(embedded_path.read_text())
        chunks = [ChunkRecord(**d) for d in data]
        print(f"\nLoaded {len(chunks)} embedded chunks for Pinecone upload")

        pinecone_key = load_env_value("PINECONE_API_KEY")
        if not pinecone_key:
            print("PINECONE_API_KEY not found. Set it in .env.local or environment.")
            sys.exit(1)

        upload_to_pinecone(chunks, pinecone_key)
        print("\nPinecone upload complete!")


if __name__ == "__main__":
    main()
