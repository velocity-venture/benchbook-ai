#!/usr/bin/env python3
"""
Local vector search server for BenchBook AI.
Loads pre-embedded legal corpus chunks and serves cosine similarity search
over HTTP as a fallback when Pinecone is not configured.

Usage:
    python3 scripts/search_server.py

Reads OPENAI_API_KEY from app/.env.local or .env.local in the project root.
Listens on http://localhost:8765/search
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

import numpy as np

# Resolve paths relative to project root (parent of scripts/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CHUNKS_PATH = PROJECT_ROOT / "legal-corpus" / "_processed" / "chunks_embedded.json"
ENV_PATHS = [
    PROJECT_ROOT / "app" / ".env.local",
    PROJECT_ROOT / ".env.local",
]

HOST = "127.0.0.1"
PORT = 8765
TOP_K = 5
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIM = 3072


def load_env(path: Path) -> None:
    """Load key=value pairs from a .env.local file into os.environ."""
    if not path.exists():
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())


def load_env_paths(paths: list[Path]) -> None:
    """Load key=value pairs from multiple env files (first wins)."""
    for path in paths:
        load_env(path)


def load_chunks(path: Path):
    """Load chunks and separate metadata from embeddings matrix."""
    print(f"Loading chunks from {path} ...")
    with open(path) as f:
        raw = json.load(f)

    metadata = []
    embeddings = []
    for chunk in raw:
        emb = chunk.pop("embedding")
        metadata.append(chunk)
        embeddings.append(emb)

    matrix = np.array(embeddings, dtype=np.float32)
    # Pre-normalize rows for fast cosine similarity (dot product on unit vectors)
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    matrix = matrix / norms

    print(f"Loaded {len(metadata)} chunks, embedding matrix shape: {matrix.shape}")
    return metadata, matrix


def get_query_embedding(text: str, api_key: str) -> np.ndarray:
    """Call OpenAI embeddings API and return the vector."""
    import urllib.request

    req_body = json.dumps({
        "model": EMBEDDING_MODEL,
        "input": text,
        "dimensions": EMBEDDING_DIM,
    }).encode()

    req = urllib.request.Request(
        "https://api.openai.com/v1/embeddings",
        data=req_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())

    vec = np.array(data["data"][0]["embedding"], dtype=np.float32)
    vec = vec / np.linalg.norm(vec)
    return vec


def search(query_vec: np.ndarray, matrix: np.ndarray, metadata: list, top_k: int = TOP_K):
    """Compute cosine similarities and return top-k results, deduplicated by section."""
    scores = matrix @ query_vec  # dot product on pre-normalized vectors
    # Get more candidates than needed so we can deduplicate
    candidate_k = min(top_k * 4, len(metadata))
    top_indices = np.argpartition(scores, -candidate_k)[-candidate_k:]
    top_indices = top_indices[np.argsort(scores[top_indices])[::-1]]

    results = []
    seen_sections = set()
    for idx in top_indices:
        if len(results) >= top_k:
            break
        chunk = metadata[idx]
        # Deduplicate: keep only the best chunk per (source, section_id) pair
        section_key = (chunk.get("source", ""), chunk.get("section_id", ""))
        if section_key in seen_sections:
            continue
        seen_sections.add(section_key)
        results.append({
            "text": chunk.get("text", ""),
            "source": chunk.get("source", ""),
            "title": chunk.get("title", ""),
            "section_id": chunk.get("section_id", ""),
            "score": float(scores[idx]),
        })
    return results


class SearchHandler(BaseHTTPRequestHandler):
    metadata = None
    matrix = None
    api_key = None

    def do_POST(self):
        if self.path != "/search":
            self.send_error(404, "Not found")
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            self._respond(400, {"error": "Invalid JSON"})
            return

        query = payload.get("query")
        if not query or not isinstance(query, str):
            self._respond(400, {"error": "Missing or invalid 'query' field"})
            return

        try:
            top_k = min(int(payload.get("top_k", TOP_K)), 20)
            query_vec = get_query_embedding(query, self.api_key)
            results = search(query_vec, self.matrix, self.metadata, top_k=top_k)
            self._respond(200, {"results": results})
        except Exception as e:
            print(f"Search error: {e}", file=sys.stderr)
            self._respond(500, {"error": str(e)})

    def do_GET(self):
        if self.path == "/health":
            self._respond(200, {
                "status": "ok",
                "chunks": len(self.metadata),
            })
            return
        self.send_error(404, "Not found")

    def _respond(self, status: int, data: dict):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print(f"[search] {args[0]}")


def main():
    load_env_paths(ENV_PATHS)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not found in .env.local or environment", file=sys.stderr)
        sys.exit(1)

    metadata, matrix = load_chunks(CHUNKS_PATH)

    SearchHandler.metadata = metadata
    SearchHandler.matrix = matrix
    SearchHandler.api_key = api_key

    server = HTTPServer((HOST, PORT), SearchHandler)
    print(f"Search server listening on http://{HOST}:{PORT}")
    print(f"  POST /search  — query the corpus")
    print(f"  GET  /health   — health check")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()


if __name__ == "__main__":
    main()
