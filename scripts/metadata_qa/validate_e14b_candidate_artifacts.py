#!/usr/bin/env python3
"""Validate Phase E14-B candidate remediation artifacts.

This validator is local-only. It checks required files, row counts, headers,
manifests, secret-shaped patterns, and body-text field exclusions. It does not
connect to any database, read source PDFs, read generated corpus body files,
generate embeddings, or print candidate row contents.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
E14B_DIR = ROOT / "docs/preview-corpus-e14b"
ARTIFACT_DIR = E14B_DIR / "candidate-remediation-artifacts"
MANIFEST_DIR = E14B_DIR / "manifests"
DASHBOARD_DIR = E14B_DIR / "dashboards"

EXPECTED_COUNTS = {
    "unresolved_identity_patch_map_candidate.csv": 38,
    "unknown_effectivity_patch_map_candidate.csv": 54,
    "qa_signoff_decision_register_candidate.csv": 439,
    "dcs_document_anchored_mapping_candidate.csv": 1146,
    "restricted_lexis_disposition_register_candidate.csv": 2392,
    "pending_extraction_qa_decision_register_candidate.csv": 4198,
    "dcs_handbook_reconciliation_evidence_register_candidate.csv": 8,
}

REQUIRED_DOCS = [
    "00_PHASE_E14B_LOCAL_METADATA_REMEDIATION_ARTIFACT_PACKAGE.md",
    "01_OWNER_APPROVAL_SCOPE.md",
    "02_E14A_BASELINE_AND_INPUTS.md",
    "03_CANDIDATE_ARTIFACT_GENERATION_METHOD.md",
    "04_UNRESOLVED_IDENTITY_CANDIDATE_PATCHES.md",
    "05_EFFECTIVITY_CANDIDATE_PATCHES.md",
    "06_QA_SIGNOFF_DECISION_REGISTER.md",
    "07_DCS_DOCUMENT_ANCHORED_CANDIDATE_MAPPING.md",
    "08_RESTRICTED_LEXIS_CANDIDATE_DISPOSITION.md",
    "09_PENDING_EXTRACTION_QA_CANDIDATE_DISPOSITION.md",
    "10_DCS_HANDBOOK_EVIDENCE_REGISTER.md",
    "11_ARTIFACT_VALIDATION_RESULTS.md",
    "12_LOCAL_DRY_RUN_AND_GATE_BASELINE.md",
    "13_CORPUS_ADMIN_REVIEW_DASHBOARD.md",
    "14_OWNER_DECISION_PACKET.md",
    "15_E15_PREVIEW_RELOAD_PLANNING_INPUTS.md",
    "16_PRODUCTION_READINESS_DELTA.md",
    "17_NEXT_PHASE_PROMPT.md",
    "18_NEXT_SESSION_START_HERE.md",
]

REQUIRED_DASHBOARDS = [
    "corpus_admin_dashboard.md",
    "owner_decision_dashboard.md",
    "production_readiness_dashboard.md",
    "qa_blocker_burndown_dashboard.md",
]

REQUIRED_MANIFESTS = [
    "candidate_artifact_manifest.json",
    "queue_to_candidate_mapping_manifest.json",
    "validation_manifest.json",
    "production_blocker_manifest.json",
]

REQUIRED_FIELDS = {
    "artifact_type",
    "source_queue",
    "queue_category",
    "proposed_action",
    "decision_status",
    "reviewer_role",
    "reviewer_name",
    "review_date",
    "owner_escalation_required",
    "production_impact",
    "stop_condition",
}

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

SECRET_PATTERNS = [
    ("private credential marker", re.compile("BEGIN" + r"\s+" + "RSA|PRIVATE" + r"\s+" + "KEY", re.IGNORECASE)),
    ("supabase access token name", re.compile("SUPABASE" + "_ACCESS" + "_TOKEN", re.IGNORECASE)),
    ("privileged role marker", re.compile("service" + r"[_-]" + "role", re.IGNORECASE)),
    ("postgres URL marker", re.compile("post" + "gres(?:ql)?" + r"://", re.IGNORECASE)),
    ("credential word", re.compile(r"pass" + r"word", re.IGNORECASE)),
    ("auth header marker", re.compile("B" + "earer", re.IGNORECASE)),
    ("compact token marker", re.compile(r"\b" + "j" + r"wt\b", re.IGNORECASE)),
    ("encoded token prefix marker", re.compile("ey" + "J")),
    ("unsafe bulk-load marker", re.compile("CO" + "PY" + r"\s+.*" + "authority_" + "chunks", re.IGNORECASE)),
]


def normalized(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("-", "_")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def scan_text(path: Path, errors: list[str]) -> None:
    text = read_text(path)
    for label, pattern in SECRET_PATTERNS:
        if pattern.search(text):
            errors.append(f"{path.relative_to(ROOT)}: secret-shaped pattern found: {label}")


def prohibited_header_hits(headers: set[str]) -> list[str]:
    hits = []
    for header in headers:
        if header in PROHIBITED_COLUMNS:
            hits.append(header)
            continue
        if any(header == token or header.endswith("_" + token) or token + "_" in header for token in PROHIBITED_COLUMNS):
            hits.append(header)
    return sorted(hits)


def validate_csv(path: Path, expected_count: int, errors: list[str]) -> dict[str, Any]:
    scan_text(path, errors)
    try:
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            headers = {normalized(header) for header in (reader.fieldnames or [])}
            row_count = sum(1 for _ in reader)
    except csv.Error as exc:
        errors.append(f"{path.relative_to(ROOT)}: CSV parse error: {exc}")
        return {"expected": expected_count, "observed": None, "status": "fail"}

    missing = sorted(REQUIRED_FIELDS - headers)
    if missing:
        errors.append(f"{path.relative_to(ROOT)}: missing field(s): {', '.join(missing)}")
    prohibited = prohibited_header_hits(headers)
    if prohibited:
        errors.append(f"{path.relative_to(ROOT)}: prohibited body-text field(s): {', '.join(prohibited)}")
    if row_count != expected_count:
        errors.append(f"{path.relative_to(ROOT)}: expected {expected_count} rows, observed {row_count}")
    return {
        "expected": expected_count,
        "observed": row_count,
        "status": "pass" if row_count == expected_count and not missing and not prohibited else "fail",
    }


def validate_json(path: Path, errors: list[str]) -> None:
    scan_text(path, errors)
    try:
        json.loads(read_text(path))
    except json.JSONDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: JSON parse error: {exc}")


def required_file_checks(errors: list[str]) -> None:
    for filename in REQUIRED_DOCS:
        path = E14B_DIR / filename
        if not path.is_file():
            errors.append(f"missing doc: {filename}")
        else:
            scan_text(path, errors)
    for filename in REQUIRED_DASHBOARDS:
        path = DASHBOARD_DIR / filename
        if not path.is_file():
            errors.append(f"missing dashboard: {filename}")
        else:
            scan_text(path, errors)
    for filename in REQUIRED_MANIFESTS:
        path = MANIFEST_DIR / filename
        if not path.is_file():
            errors.append(f"missing manifest: {filename}")
        else:
            validate_json(path, errors)
    manifest_path = ARTIFACT_DIR / "metadata_patch_manifest_candidate.json"
    if not manifest_path.is_file():
        errors.append("missing candidate metadata patch manifest")
    else:
        validate_json(manifest_path, errors)


def write_validation_manifest(status: str, count_results: dict[str, Any], errors: list[str]) -> None:
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    data = {
        "phase": "E14-B",
        "status": status,
        "metadata_only": True,
        "remote_database_connection": False,
        "body_text_printed": False,
        "row_contents_printed": False,
        "count_results": count_results,
        "prohibited_body_text_headers_absent": not any("prohibited body-text" in error for error in errors),
        "secret_patterns_absent": not any("secret-shaped" in error for error in errors),
        "required_fields_present": not any("missing field" in error for error in errors),
        "manifest_json_parse": not any("JSON parse error" in error for error in errors),
        "error_count": len(errors),
        "errors": errors[:25],
    }
    (MANIFEST_DIR / "validation_manifest.json").write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_validation_doc(status: str, count_results: dict[str, Any]) -> None:
    rows = []
    for name, result in count_results.items():
        rows.append(f"| `{name}` | {result['expected']} | {result['observed']} | {result['status']} |")
    table = "\n".join(["| Artifact | Expected | Observed | Status |", "|---|---:|---:|---|", *rows])
    body = f"""# Artifact Validation Results

Status: `{status}`

## Candidate count validation

{table}

## Validator posture

- Metadata-only: true.
- Remote database connection: false.
- Body text printed: false.
- Row contents printed: false.
"""
    (E14B_DIR / "11_ARTIFACT_VALIDATION_RESULTS.md").write_text(body, encoding="utf-8")


def main() -> int:
    errors: list[str] = []
    count_results: dict[str, Any] = {}
    required_file_checks(errors)
    for filename, expected_count in EXPECTED_COUNTS.items():
        path = ARTIFACT_DIR / filename
        if not path.is_file():
            errors.append(f"missing candidate artifact: {filename}")
            count_results[filename] = {"expected": expected_count, "observed": None, "status": "fail"}
            continue
        count_results[filename] = validate_csv(path, expected_count, errors)

    status = "PASS" if not errors else "FAIL"
    write_validation_manifest(status, count_results, errors)
    write_validation_doc(status, count_results)

    if errors:
        print("E14-B candidate artifact validation: FAIL")
        print(f"errors: {len(errors)}")
        for error in errors:
            print(f"- {error}")
        return 1

    print("E14-B candidate artifact validation: PASS")
    print(f"candidate_artifacts_checked: {len(EXPECTED_COUNTS)}")
    print("count_targets: PASS")
    print("prohibited_body_text_headers_absent: PASS")
    print("required_fields_present: PASS")
    print("manifest_json_parse: PASS")
    print("secret_patterns_absent: PASS")
    print("remote_database_connection: false")
    print("body_text_printed: false")
    return 0


if __name__ == "__main__":
    sys.exit(main())
