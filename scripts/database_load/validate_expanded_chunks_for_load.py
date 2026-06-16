#!/usr/bin/env python3
"""Static metadata and hash validation for Phase E2 dry-run loading.

The script reads ignored derivative corpus files but never prints chunk body
text. It reports counts, validation results, and blockers only.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/source-manifest/SOURCE_MANIFEST.jsonl"
CHUNKS = ROOT / "data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl"
SUMMARY = ROOT / "data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json"
WARNINGS = ROOT / "data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json"
DEDUPE = ROOT / "data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json"
MIGRATIONS_DRAFT = ROOT / "supabase/migrations_draft"

EXPECTED_FAMILIES = {
    "tca_title_36",
    "tca_title_37",
    "tenn_rules_juvenile_practice_procedure",
    "tenn_rules_evidence",
    "dcs_policies_procedures",
}

RESTRICTED_CHUNK_TYPES = {
    "annotation_candidate",
    "case_note_candidate",
    "advisory_comment",
}

BLACK_LETTER_FAMILIES = {
    "tca_title_36",
    "tca_title_37",
    "tenn_rules_juvenile_practice_procedure",
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


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def iter_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            yield line_number, json.loads(line)


def missing(value: Any) -> bool:
    return value is None or value == "" or value == [] or value == {}


def warning_code(value: Any) -> str:
    if isinstance(value, str):
        return value.split(":", 1)[0]
    if isinstance(value, dict):
        return str(value.get("code") or "unknown")
    return "unknown"


def normalize_alias(value: str) -> str:
    return "".join(ch.lower() for ch in value if ch.isalnum())


def load_manifest() -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    by_hash: dict[str, dict[str, Any]] = {}
    source_types: Counter[str] = Counter()
    authority_families: Counter[str] = Counter()
    invalid_sha = 0
    total_rows = 0

    for _, row in iter_jsonl(MANIFEST):
        total_rows += 1
        sha = row.get("sha256")
        if not (isinstance(sha, str) and len(sha) == 64):
            invalid_sha += 1
            continue
        by_hash[sha] = row
        source_types[str(row.get("source_type") or "")] += 1
        authority_families[str(row.get("authority_family") or "")] += 1

    return by_hash, {
        "path": str(MANIFEST.relative_to(ROOT)),
        "rows": total_rows,
        "unique_sha256_count": len(by_hash),
        "source_type_counts": dict(source_types),
        "authority_family_counts": dict(authority_families),
        "invalid_sha256_count": invalid_sha,
        "file_sha256": sha256_file(MANIFEST),
    }


def validate_chunks(manifest_by_hash: dict[str, dict[str, Any]]) -> dict[str, Any]:
    total = 0
    missing_required: Counter[str] = Counter()
    family_counts: Counter[str] = Counter()
    source_type_counts: Counter[str] = Counter()
    corpus_counts: Counter[str] = Counter()
    approval_counts: Counter[str] = Counter()
    display_counts: Counter[str] = Counter()
    chunk_type_counts: Counter[str] = Counter()
    warning_counts: Counter[str] = Counter()
    tre_scope_counts: Counter[str] = Counter()
    restricted_by_type: Counter[str] = Counter()
    text_hash_mismatches = 0
    invalid_text_hash = 0
    missing_manifest_hash = 0
    unknown_family = 0
    invalid_page_span = 0
    restricted_gate_violations = 0
    dcs_policy_protocol_missing_identity = 0
    black_letter_candidates = 0
    production_eligible_chunks = 0
    restricted_production_violations = 0
    pending_production_violations = 0
    chunk_ids: dict[str, str] = {}
    duplicate_chunk_conflicts = 0
    alias_targets: dict[str, set[str]] = defaultdict(set)
    chunks_with_aliases = 0
    unit_input_missing_identity = 0
    effectivity_warning_rows = 0

    for _, row in iter_jsonl(CHUNKS):
        total += 1

        for field in REQUIRED_CHUNK_FIELDS:
            if missing(row.get(field)):
                missing_required[field] += 1

        family = str(row.get("authority_family") or "")
        source_type = str(row.get("source_type") or "")
        corpus = str(row.get("corpus_designation") or "")
        approval = str(row.get("approval_status") or "")
        display = str(row.get("production_display_status") or "")
        chunk_type = str(row.get("chunk_type") or "")

        family_counts[family] += 1
        source_type_counts[source_type] += 1
        corpus_counts[corpus] += 1
        approval_counts[approval] += 1
        display_counts[display] += 1
        chunk_type_counts[chunk_type] += 1

        if family not in EXPECTED_FAMILIES:
            unknown_family += 1

        manifest_hash = row.get("source_manifest_sha256")
        if manifest_hash not in manifest_by_hash:
            missing_manifest_hash += 1

        text = row.get("text")
        expected_hash = row.get("text_sha256")
        if not (isinstance(expected_hash, str) and len(expected_hash) == 64):
            invalid_text_hash += 1
        elif isinstance(text, str) and sha256_text(text) != expected_hash:
            text_hash_mismatches += 1

        chunk_id = str(row.get("chunk_id") or "")
        if chunk_id:
            prior = chunk_ids.get(chunk_id)
            if prior and prior != expected_hash:
                duplicate_chunk_conflicts += 1
            chunk_ids[chunk_id] = str(expected_hash)

        page_start = row.get("page_start")
        page_end = row.get("page_end")
        if isinstance(page_start, int) and isinstance(page_end, int) and page_start > page_end:
            invalid_page_span += 1

        if chunk_type in RESTRICTED_CHUNK_TYPES:
            restricted_by_type[chunk_type] += 1
            if display != "restricted_pending_license_review":
                restricted_gate_violations += 1

        if display == "restricted_pending_license_review" and approval == "approved_for_production":
            restricted_production_violations += 1
        if display == "pending_extraction_qa" and approval == "approved_for_production":
            pending_production_violations += 1

        if approval == "approved_for_production" and display in {"displayable_black_letter", "displayable_policy_text"}:
            production_eligible_chunks += 1

        if family == "tenn_rules_evidence":
            tre_scope_counts[str(row.get("answer_scope_note") or "")] += 1

        if family == "dcs_policies_procedures" and chunk_type in {"policy_text", "protocol"}:
            if missing(row.get("policy_number")):
                dcs_policy_protocol_missing_identity += 1

        if family in BLACK_LETTER_FAMILIES and chunk_type == "black_letter_text":
            black_letter_candidates += 1

        has_identity = any(
            not missing(row.get(field))
            for field in ("canonical_citation", "section", "rule_number", "policy_number")
        )
        if not has_identity and chunk_type != "metadata":
            unit_input_missing_identity += 1

        for alias in row.get("citation_aliases") or []:
            if isinstance(alias, str) and alias.strip():
                chunks_with_aliases += 1
                target = str(row.get("canonical_citation") or row.get("policy_number") or row.get("rule_number") or row.get("chunk_id"))
                alias_targets[normalize_alias(alias)].add(target)

        row_effective_warning = False
        for warning in row.get("extraction_warnings") or []:
            code = warning_code(warning)
            warning_counts[code] += 1
            if code in {"effective_dated_version_unit", "effective_dated_version_text"}:
                row_effective_warning = True
        if row_effective_warning:
            effectivity_warning_rows += 1

    alias_collision_count = sum(1 for targets in alias_targets.values() if len(targets) > 1)

    return {
        "path": str(CHUNKS.relative_to(ROOT)),
        "file_sha256": sha256_file(CHUNKS),
        "total_chunks": total,
        "missing_required_counts": dict(missing_required.most_common()),
        "source_type_counts": dict(source_type_counts),
        "authority_family_counts": dict(family_counts),
        "corpus_designation_counts": dict(corpus_counts),
        "approval_status_counts": dict(approval_counts),
        "display_status_counts": dict(display_counts),
        "chunk_type_counts": dict(chunk_type_counts),
        "chunk_warning_counts": dict(warning_counts),
        "restricted_by_chunk_type": dict(restricted_by_type),
        "tre_answer_scope_note_counts": dict(tre_scope_counts),
        "unknown_family_count": unknown_family,
        "missing_manifest_hash_count": missing_manifest_hash,
        "invalid_text_hash_count": invalid_text_hash,
        "text_hash_mismatch_count": text_hash_mismatches,
        "duplicate_chunk_conflict_count": duplicate_chunk_conflicts,
        "invalid_page_span_count": invalid_page_span,
        "restricted_gate_violation_count": restricted_gate_violations,
        "production_eligible_chunks": production_eligible_chunks,
        "restricted_production_violation_count": restricted_production_violations,
        "pending_production_violation_count": pending_production_violations,
        "black_letter_candidate_count": black_letter_candidates,
        "chunks_with_aliases": chunks_with_aliases,
        "citation_alias_collision_count": alias_collision_count,
        "unit_input_missing_identity_count": unit_input_missing_identity,
        "effectivity_warning_row_count": effectivity_warning_rows,
        "dcs_policy_protocol_missing_identity_count": dcs_policy_protocol_missing_identity,
    }


def validate_dedupe(summary: dict[str, Any]) -> dict[str, Any]:
    data = read_json(DEDUPE)
    groups = data.get("duplicate_groups") or []
    alias_count = sum(len(group.get("alias_paths") or []) for group in groups)
    skipped = summary.get("sources_skipped_duplicate")
    return {
        "path": str(DEDUPE.relative_to(ROOT)),
        "staged_dcs_files": data.get("staged_dcs_files"),
        "unique_dcs_documents": data.get("unique_dcs_documents"),
        "duplicate_group_count": len(groups),
        "skipped_duplicate_count": len(data.get("skipped_duplicate_paths") or []),
        "alias_path_count": alias_count,
        "alias_count_matches_summary_skipped_duplicates": alias_count == skipped,
        "groups_missing_primary_path": sum(1 for group in groups if missing(group.get("primary_path"))),
        "groups_missing_sha256": sum(1 for group in groups if missing(group.get("sha256"))),
    }


def warning_file_counts() -> dict[str, Any]:
    data = read_json(WARNINGS)
    counts: Counter[str] = Counter()
    for item in data.get("warnings") or []:
        counts[warning_code(item)] += 1
    return {
        "path": str(WARNINGS.relative_to(ROOT)),
        "warning_count": data.get("warning_count"),
        "warning_counts": dict(counts),
    }


def migration_readiness() -> dict[str, Any]:
    files = sorted(str(path.relative_to(ROOT)) for path in MIGRATIONS_DRAFT.glob("*.sql"))
    return {
        "draft_migration_count": len(files),
        "draft_migrations": files,
        "has_audit_tables_draft": any("006_audit_tables" in file for file in files),
        "has_views_rpcs_draft": any("008_views_rpcs" in file for file in files),
        "has_rls_draft": any("009_rls_grants" in file for file in files),
    }


def build_report() -> dict[str, Any]:
    manifest_by_hash, manifest_report = load_manifest()
    summary = read_json(SUMMARY)
    chunks = validate_chunks(manifest_by_hash)
    warnings = warning_file_counts()
    dedupe = validate_dedupe(summary)

    validations = {
        "source_manifest_hash_reconciliation": chunks["missing_manifest_hash_count"] == 0,
        "chunk_text_hash_reconciliation": chunks["text_hash_mismatch_count"] == 0 and chunks["invalid_text_hash_count"] == 0,
        "corpus_build_version_assignment_inputs": bool(summary.get("pipeline_version")) and bool(manifest_report["file_sha256"]) and bool(chunks["file_sha256"]),
        "authority_family_mapping": chunks["unknown_family_count"] == 0,
        "authority_unit_and_version_inputs": chunks["unit_input_missing_identity_count"] == 0,
        "version_effectivity_partitioning_required": chunks["effectivity_warning_row_count"] > 0,
        "current_future_superseded_status_requires_loader_partitioning": True,
        "tre_limited_scope_present": all(
            ("evidentiary" in note.lower() or "evidence" in note.lower())
            and ("only" in note.lower() or "guardrail" in note.lower())
            for note in chunks["tre_answer_scope_note_counts"]
        ) and bool(chunks["tre_answer_scope_note_counts"]),
        "dcs_deduplication_alias_membership": dedupe["alias_count_matches_summary_skipped_duplicates"],
        "display_license_gates": chunks["restricted_gate_violation_count"] == 0,
        "annotation_case_note_editorial_restrictions": all(
            count > 0 for count in chunks["restricted_by_chunk_type"].values()
        ),
        "black_letter_only_retrieval_eligibility_inputs": chunks["black_letter_candidate_count"] > 0,
        "citation_alias_creation_inputs": chunks["chunks_with_aliases"] > 0,
        "page_span_preservation": chunks["invalid_page_span_count"] == 0,
        "warning_import_inputs": warnings["warning_count"] == summary.get("warning_count"),
        "audit_support_table_drafts_ready": migration_readiness()["has_audit_tables_draft"],
        "no_unsupported_production_display": chunks["restricted_production_violation_count"] == 0 and chunks["pending_production_violation_count"] == 0,
    }

    blockers: list[str] = []
    if not validations["source_manifest_hash_reconciliation"]:
        blockers.append("Some chunks do not reconcile to a source manifest SHA-256.")
    if not validations["chunk_text_hash_reconciliation"]:
        blockers.append("Some chunk text hashes do not match their text.")
    if not validations["authority_family_mapping"]:
        blockers.append("Some chunks use unknown authority families.")
    if chunks["unit_input_missing_identity_count"]:
        blockers.append("Some non-metadata chunks lack citation, section, rule, or policy identity.")
    if chunks["effectivity_warning_row_count"]:
        blockers.append("Effective-dated rows require version partitioning and QA signoff before production.")
    if not validations["dcs_deduplication_alias_membership"]:
        blockers.append("DCS duplicate alias path counts do not reconcile.")
    if not validations["display_license_gates"]:
        blockers.append("Restricted chunk types have display-gate violations.")
    if chunks["display_status_counts"].get("pending_extraction_qa", 0):
        blockers.append("Pending extraction QA chunks cannot be production-displayable by default.")
    if chunks["display_status_counts"].get("restricted_pending_license_review", 0):
        blockers.append("Restricted chunks require Judge or delegated corpus administrator display approval before production use.")
    if summary.get("sources_failed_or_ocr"):
        blockers.append("Encrypted or OCR-blocked DCS handbook remains skipped for first load.")
    if chunks["dcs_policy_protocol_missing_identity_count"]:
        blockers.append("Some DCS policy or protocol chunks lack policy identity metadata.")

    return {
        "metadata_only": True,
        "body_text_printed": False,
        "manifest": manifest_report,
        "summary": {
            "path": str(SUMMARY.relative_to(ROOT)),
            "pipeline_version": summary.get("pipeline_version"),
            "total_chunks": summary.get("total_chunks"),
            "sources_selected": summary.get("sources_selected"),
            "sources_extracted": summary.get("sources_extracted"),
            "sources_skipped_duplicate": summary.get("sources_skipped_duplicate"),
            "sources_failed_or_ocr_count": len(summary.get("sources_failed_or_ocr") or []),
            "chunks_with_warnings": summary.get("chunks_with_warnings"),
            "warning_count": summary.get("warning_count"),
            "duplicate_text_groups": summary.get("duplicate_text_groups"),
        },
        "chunks": chunks,
        "warnings": warnings,
        "dedupe": dedupe,
        "migration_readiness": migration_readiness(),
        "validations": validations,
        "candidate_blockers": blockers,
    }


def print_text(report: dict[str, Any]) -> None:
    print("BenchBook.AI Phase E2 static load validation")
    print("metadata_only: true")
    print("body_text_printed: false")
    print(f"manifest_rows: {report['manifest']['rows']}")
    print(f"expanded_chunks: {report['chunks']['total_chunks']}")
    print(f"summary_total_chunks: {report['summary']['total_chunks']}")
    print(f"text_hash_mismatches: {report['chunks']['text_hash_mismatch_count']}")
    print(f"missing_manifest_hashes: {report['chunks']['missing_manifest_hash_count']}")
    print(f"unknown_authority_families: {report['chunks']['unknown_family_count']}")
    print(f"restricted_chunks: {report['chunks']['display_status_counts'].get('restricted_pending_license_review', 0)}")
    print(f"pending_extraction_qa_chunks: {report['chunks']['display_status_counts'].get('pending_extraction_qa', 0)}")
    print(f"effective_warning_rows: {report['chunks']['effectivity_warning_row_count']}")
    print(f"dcs_alias_paths: {report['dedupe']['alias_path_count']}")
    print(f"draft_migration_count: {report['migration_readiness']['draft_migration_count']}")
    print("validations:")
    for key, value in report["validations"].items():
        print(f"- {key}: {value}")
    print("candidate_blockers:")
    for blocker in report["candidate_blockers"]:
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
