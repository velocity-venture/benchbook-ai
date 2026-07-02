#!/usr/bin/env python3
"""Validate Phase E14-A draft remediation artifacts.

This validator is intentionally local-only. It reads only E14-A docs,
metadata-only CSV templates, checklist files, and the draft JSON manifest. It
does not import database clients, connect to any database, read source PDFs,
read generated corpus body text, generate embeddings, or modify files.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
E14_DIR = ROOT / "docs/preview-corpus-e14"
ARTIFACT_DIR = E14_DIR / "draft-remediation-artifacts"
CHECKLIST_DIR = E14_DIR / "checklists"

REQUIRED_DOCS = [
    "00_PHASE_E14A_LOCAL_METADATA_REMEDIATION_IMPLEMENTATION_PLAN.md",
    "01_OWNER_APPROVAL_SCOPE.md",
    "02_E13_BASELINE_AND_REVIEW_QUEUE_STATUS.md",
    "03_LOCAL_REMEDIATION_ARTIFACT_DESIGN.md",
    "04_UNRESOLVED_IDENTITY_PATCH_MAP_PLAN.md",
    "05_EFFECTIVITY_PATCH_MAP_PLAN.md",
    "06_QA_SIGNOFF_ARTIFACT_PLAN.md",
    "07_DCS_DOCUMENT_ANCHORED_MAPPING_PLAN.md",
    "08_RESTRICTED_LEXIS_DISPOSITION_ARTIFACT_PLAN.md",
    "09_PENDING_EXTRACTION_QA_ARTIFACT_PLAN.md",
    "10_DCS_HANDBOOK_RECONCILIATION_ARTIFACT_PLAN.md",
    "11_LOCAL_VALIDATION_AND_TEST_PLAN.md",
    "12_IMPLEMENTATION_OPTIONS_AND_DISPOSITIONS.md",
    "13_OWNER_DECISION_PACKET_FOR_E14B_OR_E15.md",
    "14_NEXT_PHASE_PROMPT.md",
    "15_NEXT_SESSION_START_HERE.md",
]

REQUIRED_CSV_ARTIFACTS = [
    "unresolved_identity_patch_map_template.csv",
    "unknown_effectivity_patch_map_template.csv",
    "qa_signoff_decision_register_template.csv",
    "dcs_document_anchored_mapping_template.csv",
    "restricted_lexis_disposition_register_template.csv",
    "pending_extraction_qa_decision_register_template.csv",
    "dcs_handbook_reconciliation_evidence_register_template.csv",
]

REQUIRED_CHECKLISTS = [
    "corpus_admin_unresolved_identity_checklist.md",
    "corpus_admin_effectivity_checklist.md",
    "corpus_admin_restricted_content_checklist.md",
    "corpus_admin_dcs_mapping_checklist.md",
    "corpus_admin_pre_reload_gate_checklist.md",
]

MANIFEST_FILE = "metadata_patch_manifest_template.json"

PROHIBITED_COLUMNS = {
    "text",
    "chunk_text",
    "body",
    "body_text",
    "source_text",
    "content",
    "excerpt",
    "full_text",
    "page_text",
    "ocr_text",
}

REQUIRED_DECISION_COLUMNS = {
    "proposed_action",
    "decision_status",
    "reviewer_role",
    "reviewer_name",
    "review_date",
    "owner_escalation_required",
    "production_impact",
    "stop_condition",
}

UNSAFE_WRITE_TARGET_COLUMNS = {
    "write_target",
    "target_path",
    "apply_target",
    "mutation_target",
    "output_path",
    "destination_path",
}

UNSAFE_WRITE_TARGET_PATTERNS = [
    re.compile(r"(^|/)(app|src)(/|$)", re.IGNORECASE),
    re.compile(r"(^|/)supabase/(migrations|migrations_draft)(/|$)", re.IGNORECASE),
    re.compile(r"(^|/)scripts/(database_load|ingestion|corpus)(/|$)", re.IGNORECASE),
    re.compile(r"(^|/)data/(ingestion-expanded|source-pdfs|source_pdfs)(/|$)", re.IGNORECASE),
]

SECRET_PATTERNS = [
    ("private credential marker", re.compile("BEGIN" + r"\s+" + "RSA|PRIVATE" + r"\s+" + "KEY", re.IGNORECASE)),
    ("supabase access token name", re.compile("SUPABASE" + "_ACCESS" + "_TOKEN", re.IGNORECASE)),
    ("privileged role marker", re.compile("service" + r"[-_]" + "role", re.IGNORECASE)),
    ("postgres URL marker", re.compile("postgres(?:ql)?" + r"://", re.IGNORECASE)),
    ("credential word", re.compile(r"pass" + r"word", re.IGNORECASE)),
    ("auth header marker", re.compile("B" + "earer", re.IGNORECASE)),
    ("compact token marker", re.compile(r"\bj" + r"wt\b", re.IGNORECASE)),
    ("encoded token prefix marker", re.compile("ey" + "J")),
]


def normalized(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("-", "_")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def validate_required_files(errors: list[str]) -> None:
    for filename in REQUIRED_DOCS:
        if not (E14_DIR / filename).is_file():
            errors.append(f"missing required doc: {filename}")
    for filename in REQUIRED_CSV_ARTIFACTS:
        if not (ARTIFACT_DIR / filename).is_file():
            errors.append(f"missing required CSV artifact: {filename}")
    for filename in REQUIRED_CHECKLISTS:
        if not (CHECKLIST_DIR / filename).is_file():
            errors.append(f"missing required checklist: {filename}")
    if not (ARTIFACT_DIR / MANIFEST_FILE).is_file():
        errors.append(f"missing required JSON artifact: {MANIFEST_FILE}")


def validate_secret_scan(path: Path, errors: list[str]) -> None:
    text = read_text(path)
    for label, pattern in SECRET_PATTERNS:
        if pattern.search(text):
            errors.append(f"{path.relative_to(ROOT)}: secret-shaped pattern found: {label}")


def validate_checklists(errors: list[str]) -> None:
    for filename in REQUIRED_CHECKLISTS:
        path = CHECKLIST_DIR / filename
        if not path.exists():
            continue
        validate_secret_scan(path, errors)
        text = read_text(path).lower()
        for required_phrase in ("stop condition", "review", "metadata"):
            if required_phrase not in text:
                errors.append(f"{path.relative_to(ROOT)}: missing checklist phrase: {required_phrase}")


def validate_csv_artifact(path: Path, errors: list[str]) -> None:
    validate_secret_scan(path, errors)
    try:
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            headers = reader.fieldnames or []
            normalized_headers = {normalized(header) for header in headers}
            rows = list(reader)
    except csv.Error as exc:
        errors.append(f"{path.relative_to(ROOT)}: CSV parse error: {exc}")
        return
    except OSError as exc:
        errors.append(f"{path.relative_to(ROOT)}: read error: {exc}")
        return

    if not headers:
        errors.append(f"{path.relative_to(ROOT)}: missing CSV header")
        return

    prohibited_hits = sorted(
        header
        for header in normalized_headers
        if header in PROHIBITED_COLUMNS
        or any(header == token or header.endswith("_" + token) or token + "_" in header for token in PROHIBITED_COLUMNS)
    )
    if prohibited_hits:
        errors.append(f"{path.relative_to(ROOT)}: prohibited body-text column(s): {', '.join(prohibited_hits)}")

    missing_decision = sorted(REQUIRED_DECISION_COLUMNS - normalized_headers)
    if missing_decision:
        errors.append(f"{path.relative_to(ROOT)}: missing decision column(s): {', '.join(missing_decision)}")

    unsafe_columns = sorted(UNSAFE_WRITE_TARGET_COLUMNS & normalized_headers)
    if unsafe_columns:
        errors.append(f"{path.relative_to(ROOT)}: unsafe write-target column(s): {', '.join(unsafe_columns)}")

    for row_index, row in enumerate(rows, start=2):
        for column, value in row.items():
            column_name = normalized(column or "")
            text = str(value or "")
            if column_name in UNSAFE_WRITE_TARGET_COLUMNS and text.strip():
                errors.append(f"{path.relative_to(ROOT)}:{row_index}: write-target value is not allowed")
            if any(pattern.search(text) for pattern in UNSAFE_WRITE_TARGET_PATTERNS):
                lower = text.lower()
                if any(marker in lower for marker in ("write", "apply", "mutate", "replace", "target")):
                    errors.append(f"{path.relative_to(ROOT)}:{row_index}: active path appears to be a write target")


def validate_manifest(errors: list[str]) -> None:
    path = ARTIFACT_DIR / MANIFEST_FILE
    if not path.exists():
        return
    validate_secret_scan(path, errors)
    try:
        data: dict[str, Any] = json.loads(read_text(path))
    except json.JSONDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: JSON parse error: {exc}")
        return

    expected_booleans = {
        "metadata_only": True,
        "body_text_allowed": False,
        "remote_write_allowed": False,
        "corpus_load_allowed": False,
        "embedding_generation_allowed": False,
        "app_integration_allowed": False,
        "display_gate_change_allowed": False,
    }
    for key, expected in expected_booleans.items():
        if data.get(key) is not expected:
            errors.append(f"{path.relative_to(ROOT)}: expected {key} to be {expected}")

    listed_csv = set(data.get("required_csv_artifacts") or [])
    missing_listed = sorted(set(REQUIRED_CSV_ARTIFACTS) - listed_csv)
    if missing_listed:
        errors.append(f"{path.relative_to(ROOT)}: manifest missing CSV artifact(s): {', '.join(missing_listed)}")

    listed_fields = set(data.get("required_decision_fields") or [])
    missing_fields = sorted(REQUIRED_DECISION_COLUMNS - listed_fields)
    if missing_fields:
        errors.append(f"{path.relative_to(ROOT)}: manifest missing decision field(s): {', '.join(missing_fields)}")


def main() -> int:
    errors: list[str] = []
    validate_required_files(errors)

    for filename in REQUIRED_CSV_ARTIFACTS:
        path = ARTIFACT_DIR / filename
        if path.exists():
            validate_csv_artifact(path, errors)

    validate_manifest(errors)
    validate_checklists(errors)

    if errors:
        print("E14-A draft artifact validation: FAIL")
        print(f"errors: {len(errors)}")
        for error in errors:
            print(f"- {error}")
        return 1

    print("E14-A draft artifact validation: PASS")
    print(f"docs_checked: {len(REQUIRED_DOCS)}")
    print(f"csv_artifacts_checked: {len(REQUIRED_CSV_ARTIFACTS)}")
    print(f"checklists_checked: {len(REQUIRED_CHECKLISTS)}")
    print("json_manifest_checked: PASS")
    print("prohibited_body_text_headers_absent: PASS")
    print("decision_fields_present: PASS")
    print("secret_patterns_absent: PASS")
    print("unsafe_write_targets_absent: PASS")
    print("remote_database_connection: false")
    print("body_text_printed: false")
    return 0


if __name__ == "__main__":
    sys.exit(main())
