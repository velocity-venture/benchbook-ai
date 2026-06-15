#!/usr/bin/env python3
"""Metadata-only load-readiness inspector for BenchBook.AI Phase E1.

This script does not connect to a database, write files, load corpus data, or
print legal source text. It reports counts and candidate blockers only.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/source-manifest/SOURCE_MANIFEST.jsonl"
CHUNKS = ROOT / "data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl"
SUMMARY = ROOT / "data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json"
WARNINGS = ROOT / "data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json"
DEDUPE = ROOT / "data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json"

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

REQUIRED_CHUNK_FIELDS = {
    "chunk_id",
    "source_manifest_sha256",
    "source_path",
    "source_type",
    "authority_family",
    "corpus_designation",
    "approval_status",
    "production_display_status",
    "chunk_type",
    "text",
    "text_sha256",
}


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def is_missing(value: Any) -> bool:
    return value is None or value == "" or value == [] or value == {}


def warning_code(value: Any) -> str:
    if isinstance(value, str):
        return value.split(":", 1)[0]
    if isinstance(value, dict):
        return str(value.get("code") or "unknown")
    return "unknown"


def analyze_manifest(path: Path) -> dict[str, Any]:
    counts: Counter[str] = Counter()
    missing: Counter[str] = Counter()
    source_types: Counter[str] = Counter()
    authority_families: Counter[str] = Counter()
    invalid_sha = 0

    with path.open("r", encoding="utf-8") as handle:
      for line in handle:
        if not line.strip():
            continue
        row = json.loads(line)
        counts["rows"] += 1
        source_types[str(row.get("source_type") or "")] += 1
        authority_families[str(row.get("authority_family") or "")] += 1
        for key, value in row.items():
            if key not in TEXT_KEYS and is_missing(value):
                missing[key] += 1
        sha = row.get("sha256")
        if not (isinstance(sha, str) and len(sha) == 64):
            invalid_sha += 1

    return {
        "path": str(path.relative_to(ROOT)),
        "rows": counts["rows"],
        "source_type_counts": dict(source_types),
        "authority_family_counts": dict(authority_families),
        "missing_or_empty_counts": dict(missing.most_common()),
        "invalid_sha256_count": invalid_sha,
    }


def analyze_chunks(path: Path) -> dict[str, Any]:
    total = 0
    missing_required: Counter[str] = Counter()
    missing_any: Counter[str] = Counter()
    source_types: Counter[str] = Counter()
    authority_families: Counter[str] = Counter()
    corpus_designations: Counter[str] = Counter()
    approval_statuses: Counter[str] = Counter()
    display_statuses: Counter[str] = Counter()
    chunk_types: Counter[str] = Counter()
    document_types: Counter[str] = Counter()
    warnings: Counter[str] = Counter()
    tre_scope: Counter[str] = Counter()
    restricted_by_type: Counter[str] = Counter()
    dcs_chunk_count = 0
    dcs_missing_policy_identity = 0
    invalid_text_hash = 0
    invalid_page_span = 0

    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            total += 1

            for field in REQUIRED_CHUNK_FIELDS:
                if is_missing(row.get(field)):
                    missing_required[field] += 1

            for key, value in row.items():
                if key not in TEXT_KEYS and is_missing(value):
                    missing_any[key] += 1

            source_type = str(row.get("source_type") or "")
            family = str(row.get("authority_family") or "")
            corpus_designation = str(row.get("corpus_designation") or "")
            approval = str(row.get("approval_status") or "")
            display = str(row.get("production_display_status") or "")
            chunk_type = str(row.get("chunk_type") or "")
            document_type = str(row.get("document_type") or "")

            source_types[source_type] += 1
            authority_families[family] += 1
            corpus_designations[corpus_designation] += 1
            approval_statuses[approval] += 1
            display_statuses[display] += 1
            chunk_types[chunk_type] += 1
            document_types[document_type] += 1

            if display == "restricted_pending_license_review":
                restricted_by_type[chunk_type] += 1

            if family == "tenn_rules_evidence":
                tre_scope[str(row.get("answer_scope_note") or "")] += 1

            if family == "dcs_policies_procedures":
                dcs_chunk_count += 1
                if is_missing(row.get("policy_number")) and chunk_type in {"policy_text", "protocol"}:
                    dcs_missing_policy_identity += 1

            text_hash = row.get("text_sha256")
            if not (isinstance(text_hash, str) and len(text_hash) == 64):
                invalid_text_hash += 1

            page_start = row.get("page_start")
            page_end = row.get("page_end")
            if isinstance(page_start, int) and isinstance(page_end, int) and page_start > page_end:
                invalid_page_span += 1

            for warning in row.get("extraction_warnings") or []:
                warnings[warning_code(warning)] += 1

    return {
        "path": str(path.relative_to(ROOT)),
        "total_chunks": total,
        "missing_required_counts": dict(missing_required.most_common()),
        "missing_or_empty_metadata_counts": dict(missing_any.most_common()),
        "source_type_counts": dict(source_types),
        "authority_family_counts": dict(authority_families),
        "corpus_designation_counts": dict(corpus_designations),
        "approval_status_counts": dict(approval_statuses),
        "display_status_counts": dict(display_statuses),
        "chunk_type_counts": dict(chunk_types),
        "document_type_counts": dict(document_types),
        "chunk_warning_counts": dict(warnings),
        "restricted_by_chunk_type": dict(restricted_by_type),
        "tre_answer_scope_note_counts": dict(tre_scope),
        "dcs_chunk_count": dcs_chunk_count,
        "dcs_missing_policy_identity_for_policy_or_protocol": dcs_missing_policy_identity,
        "invalid_text_hash_count": invalid_text_hash,
        "invalid_page_span_count": invalid_page_span,
    }


def analyze_summary(path: Path) -> dict[str, Any]:
    data = read_json(path)
    allowed = {
        "generated_at",
        "pipeline_version",
        "total_chunks",
        "sources_selected",
        "sources_extracted",
        "sources_skipped_duplicate",
        "sources_failed_or_ocr",
        "chunks_with_warnings",
        "warning_count",
        "chunks_by_authority_family",
        "chunks_by_chunk_type",
        "chunks_by_corpus_designation",
        "chunks_by_display_status",
        "warning_counts_by_code",
        "duplicate_text_groups",
    }
    return {"path": str(path.relative_to(ROOT)), **{key: data.get(key) for key in allowed}}


def analyze_warning_file(path: Path) -> dict[str, Any]:
    data = read_json(path)
    counts: Counter[str] = Counter()
    for item in data.get("warnings") or []:
        counts[warning_code(item)] += 1
    return {
        "path": str(path.relative_to(ROOT)),
        "generated_at": data.get("generated_at"),
        "warning_count": data.get("warning_count"),
        "warning_counts": dict(counts),
    }


def analyze_dedupe(path: Path) -> dict[str, Any]:
    data = read_json(path)
    groups = data.get("duplicate_groups") or []
    return {
        "path": str(path.relative_to(ROOT)),
        "generated_at": data.get("generated_at"),
        "staged_dcs_files": data.get("staged_dcs_files"),
        "unique_dcs_documents": data.get("unique_dcs_documents"),
        "duplicate_group_count": len(groups),
        "skipped_duplicate_count": len(data.get("skipped_duplicate_paths") or []),
        "alias_path_count": sum(len(group.get("alias_paths") or []) for group in groups),
        "groups_missing_primary_path": sum(1 for group in groups if is_missing(group.get("primary_path"))),
        "groups_missing_sha256": sum(1 for group in groups if is_missing(group.get("sha256"))),
    }


def candidate_blockers(report: dict[str, Any]) -> list[str]:
    blockers: list[str] = []
    chunks = report["chunks"]
    summary = report["summary"]
    dedupe = report["dedupe"]
    warnings = report["warnings"]["warning_counts"]

    if report["manifest"]["invalid_sha256_count"]:
        blockers.append("Manifest contains invalid SHA-256 values.")
    if chunks["missing_required_counts"]:
        blockers.append("Some chunks are missing required loader fields.")
    if chunks["invalid_text_hash_count"]:
        blockers.append("Some chunks have invalid text SHA-256 values.")
    if chunks["invalid_page_span_count"]:
        blockers.append("Some chunks have invalid page spans.")
    if warnings.get("effective_dated_version_unit") or warnings.get("effective_dated_version_text"):
        blockers.append("Effective-dated units require version partitioning and QA.")
    if summary.get("sources_failed_or_ocr"):
        blockers.append("At least one source failed extraction or OCR handling.")
    if dedupe["alias_path_count"] != summary.get("sources_skipped_duplicate"):
        blockers.append("DCS alias path count does not match skipped duplicate count.")
    if chunks["display_status_counts"].get("restricted_pending_license_review", 0):
        blockers.append("Restricted chunks require display gate and license decisions.")
    if chunks["display_status_counts"].get("pending_extraction_qa", 0):
        blockers.append("Pending extraction QA chunks cannot be production-displayable by default.")
    if chunks["dcs_missing_policy_identity_for_policy_or_protocol"]:
        blockers.append("Some DCS policy or protocol chunks lack policy identity metadata.")

    return blockers


def build_report() -> dict[str, Any]:
    report = {
        "script": "scripts/database_load_design/inspect_load_readiness.py",
        "metadata_only": True,
        "database_connection": False,
        "writes_files": False,
        "body_text_printed": False,
        "manifest": analyze_manifest(MANIFEST),
        "chunks": analyze_chunks(CHUNKS),
        "summary": analyze_summary(SUMMARY),
        "warnings": analyze_warning_file(WARNINGS),
        "dedupe": analyze_dedupe(DEDUPE),
    }
    report["candidate_load_blockers"] = candidate_blockers(report)
    return report


def print_text(report: dict[str, Any]) -> None:
    print("BenchBook.AI Phase E1 load readiness metadata")
    print("metadata_only: true")
    print("database_connection: false")
    print("writes_files: false")
    print("body_text_printed: false")
    print(f"manifest_rows: {report['manifest']['rows']}")
    print(f"total_chunks: {report['chunks']['total_chunks']}")
    print(f"summary_total_chunks: {report['summary']['total_chunks']}")
    print(f"warning_count: {report['summary']['warning_count']}")
    print(f"restricted_chunks: {report['chunks']['display_status_counts'].get('restricted_pending_license_review', 0)}")
    print(f"pending_extraction_qa_chunks: {report['chunks']['display_status_counts'].get('pending_extraction_qa', 0)}")
    print(f"effective_dated_unit_warnings: {report['warnings']['warning_counts'].get('effective_dated_version_unit', 0)}")
    print(f"effective_dated_text_warnings: {report['warnings']['warning_counts'].get('effective_dated_version_text', 0)}")
    print(f"dcs_duplicate_groups: {report['dedupe']['duplicate_group_count']}")
    print(f"dcs_alias_paths: {report['dedupe']['alias_path_count']}")
    print("candidate_load_blockers:")
    for blocker in report["candidate_load_blockers"]:
        print(f"- {blocker}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print metadata report as JSON.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    report = build_report()
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_text(report)


if __name__ == "__main__":
    main()
