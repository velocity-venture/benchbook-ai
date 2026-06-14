#!/usr/bin/env python3
"""Metadata-only analyzer for Phase C expanded authority chunks.

This script is intentionally conservative: it never prints chunk body text.
It exists to support Phase D schema design and QA planning.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


TEXT_KEYS = {
    "text",
    "chunk_text",
    "content",
    "body",
    "markdown",
    "html",
    "source_text",
    "snippet",
    "sample",
}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def truncate(value: Any, limit: int = 180) -> Any:
    if isinstance(value, str) and len(value) > limit:
        return value[: limit - 3] + "..."
    return value


def metadata_only(obj: dict[str, Any]) -> dict[str, Any]:
    return {key: truncate(value) for key, value in obj.items() if key not in TEXT_KEYS}


def warning_code(warning: Any) -> str:
    if isinstance(warning, str):
        return warning.split(":", 1)[0]
    if isinstance(warning, dict):
        return str(warning.get("code") or "unknown")
    return "unknown"


def is_missing(value: Any) -> bool:
    return value is None or value == "" or value == [] or value == {}


def analyze_chunks(path: Path, sample_limit: int) -> dict[str, Any]:
    total = 0
    field_names: Counter[str] = Counter()
    missing: Counter[str] = Counter()
    source_type: Counter[str] = Counter()
    authority_family: Counter[str] = Counter()
    corpus_designation: Counter[str] = Counter()
    approval_status: Counter[str] = Counter()
    display_status: Counter[str] = Counter()
    chunk_type: Counter[str] = Counter()
    document_type: Counter[str] = Counter()
    warning_counts: Counter[str] = Counter()
    restricted_by_type: Counter[str] = Counter()
    effective_samples: list[dict[str, Any]] = []
    metadata_samples: list[dict[str, Any]] = []

    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            obj = json.loads(line)
            total += 1
            field_names.update(obj.keys())

            for key, value in obj.items():
                if is_missing(value):
                    missing[key] += 1

            source_type[str(obj.get("source_type") or "")] += 1
            authority_family[str(obj.get("authority_family") or "")] += 1
            corpus_designation[str(obj.get("corpus_designation") or "")] += 1
            approval_status[str(obj.get("approval_status") or "")] += 1
            display = str(obj.get("production_display_status") or "")
            display_status[display] += 1
            ctype = str(obj.get("chunk_type") or "")
            chunk_type[ctype] += 1
            document_type[str(obj.get("document_type") or "")] += 1

            if display == "restricted_pending_license_review":
                restricted_by_type[ctype] += 1

            for warning in obj.get("extraction_warnings") or []:
                code = warning_code(warning)
                warning_counts[code] += 1
                if code.startswith("effective_dated") and len(effective_samples) < sample_limit:
                    effective_samples.append(
                        metadata_only(
                            {
                                "line_number": line_number,
                                "chunk_id": obj.get("chunk_id"),
                                "canonical_citation": obj.get("canonical_citation"),
                                "title": obj.get("title"),
                                "source_type": obj.get("source_type"),
                                "authority_family": obj.get("authority_family"),
                                "chunk_type": obj.get("chunk_type"),
                                "production_display_status": obj.get("production_display_status"),
                                "warning_code": code,
                            }
                        )
                    )

            if len(metadata_samples) < sample_limit:
                metadata_samples.append(metadata_only(obj))

    return {
        "chunks_path": str(path),
        "total_chunks": total,
        "field_names": sorted(field_names),
        "missing_or_empty_counts": dict(missing.most_common()),
        "source_type_counts": dict(source_type),
        "authority_family_counts": dict(authority_family),
        "corpus_designation_counts": dict(corpus_designation),
        "approval_status_counts": dict(approval_status),
        "display_status_counts": dict(display_status),
        "chunk_type_counts": dict(chunk_type),
        "document_type_counts": dict(document_type),
        "chunk_warning_counts": dict(warning_counts),
        "restricted_by_chunk_type": dict(restricted_by_type),
        "effective_date_warning_metadata_samples": effective_samples,
        "metadata_samples_without_text": metadata_samples,
        "schema_design_fields_needed": [
            "chunk_id",
            "source_manifest_sha256",
            "source_path",
            "source_type",
            "authority_family",
            "corpus_designation",
            "approval_status",
            "production_display_status",
            "canonical_citation",
            "citation_aliases",
            "title",
            "chapter",
            "part",
            "section",
            "subsection",
            "rule_number",
            "policy_number",
            "policy_chapter",
            "document_type",
            "chunk_type",
            "page_start",
            "page_end",
            "hierarchy_path",
            "text_sha256",
            "extraction_warnings",
            "answer_scope_note",
        ],
    }


def analyze_warning_file(path: Path | None) -> dict[str, Any] | None:
    if path is None or not path.exists():
        return None
    data = load_json(path)
    counts: Counter[str] = Counter()
    for item in data.get("warnings") or []:
        counts[warning_code(item)] += 1
    return {
        "warnings_path": str(path),
        "generated_at": data.get("generated_at"),
        "warning_count": data.get("warning_count"),
        "warning_counts": dict(counts),
    }


def analyze_dedupe_file(path: Path | None) -> dict[str, Any] | None:
    if path is None or not path.exists():
        return None
    data = load_json(path)
    duplicate_groups = data.get("duplicate_groups") or []
    return {
        "dedupe_path": str(path),
        "generated_at": data.get("generated_at"),
        "staged_dcs_files": data.get("staged_dcs_files"),
        "unique_dcs_documents": data.get("unique_dcs_documents"),
        "duplicate_group_count": len(duplicate_groups),
        "skipped_duplicate_count": len(data.get("skipped_duplicate_paths") or []),
        "alias_path_count": sum(len(group.get("alias_paths") or []) for group in duplicate_groups),
        "duplicate_group_samples": [
            {
                "sha256": group.get("sha256"),
                "primary_path": truncate(group.get("primary_path")),
                "alias_path_count": len(group.get("alias_paths") or []),
            }
            for group in duplicate_groups[:5]
        ],
    }


def analyze_summary_file(path: Path | None) -> dict[str, Any] | None:
    if path is None or not path.exists():
        return None
    data = load_json(path)
    allowed_keys = {
        "generated_at",
        "pipeline_version",
        "total_chunks",
        "sources_selected",
        "sources_extracted",
        "sources_skipped_duplicate",
        "sources_failed_or_ocr",
        "chunks_with_warnings",
        "warning_count",
        "chunk_size_chars",
        "chunks_by_authority_family",
        "chunks_by_chunk_type",
        "chunks_by_corpus_designation",
        "chunks_by_display_status",
        "warning_counts_by_code",
        "duplicate_text_groups",
    }
    return {"summary_path": str(path), **{key: data.get(key) for key in allowed_keys}}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--chunks",
        type=Path,
        default=Path("data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl"),
        help="Path to EXPANDED_AUTHORITY_CHUNKS.jsonl.",
    )
    parser.add_argument(
        "--summary",
        type=Path,
        default=Path("data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json"),
        help="Optional expanded chunk summary JSON.",
    )
    parser.add_argument(
        "--warnings",
        type=Path,
        default=Path("data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json"),
        help="Optional expanded extraction warning JSON.",
    )
    parser.add_argument(
        "--dedupe",
        type=Path,
        default=Path("data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json"),
        help="Optional expanded deduplication report JSON.",
    )
    parser.add_argument(
        "--sample-limit",
        type=int,
        default=5,
        help="Number of metadata-only samples to include.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    report = {
        "analyzer": "scripts/database_design/analyze_expanded_chunks_metadata.py",
        "body_text_redacted": True,
        "chunks": analyze_chunks(args.chunks, args.sample_limit),
        "summary": analyze_summary_file(args.summary),
        "warnings": analyze_warning_file(args.warnings),
        "dedupe": analyze_dedupe_file(args.dedupe),
    }
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

