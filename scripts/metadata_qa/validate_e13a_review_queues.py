#!/usr/bin/env python3
"""Validate Phase E13-A review queues without reading any source corpus files.

This utility is intentionally local-only. It parses CSV queue files under
docs/preview-corpus-e13/review-queues, validates counts and headers, scans for
credential-shaped strings, and prints only concise status lines. It does not
connect to any database and does not print queue row contents.
"""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUEUE_DIR = ROOT / "docs/preview-corpus-e13/review-queues"

EXPECTED_COUNTS = {
    "unresolved_identity_units.csv": 17,
    "unresolved_identity_chunks.csv": 21,
    "unknown_effectivity_versions.csv": 15,
    "unknown_effectivity_chunks.csv": 39,
    "qa_signoff_required_versions_summary.csv": 439,
    "dcs_document_anchored_summary.csv": 1146,
    "restricted_lexis_content_summary.csv": 2392,
    "pending_extraction_qa_summary.csv": 4198,
    "dcs_handbook_reconciliation_checklist.csv": 8,
}

PROHIBITED_HEADER_TOKENS = {
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
    ("privileged role marker", re.compile("service" + r"[-_]" + "role", re.IGNORECASE)),
    ("postgres URL marker", re.compile("postgres(?:ql)?" + r"://", re.IGNORECASE)),
    ("credential word", re.compile(r"pass" + r"word", re.IGNORECASE)),
    ("auth header marker", re.compile("B" + "earer", re.IGNORECASE)),
    ("compact token marker", re.compile(r"\bj" + r"wt\b", re.IGNORECASE)),
    ("encoded token prefix marker", re.compile("ey" + "J")),
    (
        "unsafe bulk-load marker",
        re.compile("CO" + "PY" + r"\s+.*" + "authority_" + "chunks|" + r"\\" + "copy", re.IGNORECASE),
    ),
]


def normalized_header(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("-", "_")


def validate_file(path: Path, expected_count: int) -> list[str]:
    errors: list[str] = []
    try:
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            headers = reader.fieldnames or []
            normalized_headers = {normalized_header(header) for header in headers}

            prohibited_hits = sorted(
                header
                for header in normalized_headers
                if header in PROHIBITED_HEADER_TOKENS or any(token in header for token in PROHIBITED_HEADER_TOKENS)
            )
            if prohibited_hits:
                errors.append(f"{path.name}: prohibited header(s): {', '.join(prohibited_hits)}")

            if "queue_category" not in normalized_headers:
                errors.append(f"{path.name}: missing queue_category")
            if "proposed_action" not in normalized_headers:
                errors.append(f"{path.name}: missing proposed_action")

            row_count = 0
            missing_category = 0
            missing_action = 0
            secret_hits: set[str] = set()
            for row in reader:
                row_count += 1
                if not (row.get("queue_category") or "").strip():
                    missing_category += 1
                if not (row.get("proposed_action") or "").strip():
                    missing_action += 1
                joined = "\n".join(str(value or "") for value in row.values())
                for label, pattern in SECRET_PATTERNS:
                    if pattern.search(joined):
                        secret_hits.add(label)

            if row_count != expected_count:
                errors.append(f"{path.name}: expected {expected_count} rows, observed {row_count}")
            if missing_category:
                errors.append(f"{path.name}: {missing_category} row(s) missing queue_category")
            if missing_action:
                errors.append(f"{path.name}: {missing_action} row(s) missing proposed_action")
            if secret_hits:
                errors.append(f"{path.name}: secret-shaped pattern(s): {', '.join(sorted(secret_hits))}")
    except csv.Error as exc:
        errors.append(f"{path.name}: CSV parse error: {exc}")
    except OSError as exc:
        errors.append(f"{path.name}: read error: {exc}")
    return errors


def main() -> int:
    errors: list[str] = []
    if not QUEUE_DIR.is_dir():
        errors.append(f"Missing queue directory: {QUEUE_DIR.relative_to(ROOT)}")
    else:
        for filename, expected_count in EXPECTED_COUNTS.items():
            path = QUEUE_DIR / filename
            if not path.is_file():
                errors.append(f"{filename}: missing required queue file")
                continue
            errors.extend(validate_file(path, expected_count))

    if errors:
        print("E13-A review queue validation: FAIL")
        print(f"files_expected: {len(EXPECTED_COUNTS)}")
        print(f"errors: {len(errors)}")
        for error in errors:
            print(f"- {error}")
        return 1

    print("E13-A review queue validation: PASS")
    print(f"files_checked: {len(EXPECTED_COUNTS)}")
    print("count_targets: PASS")
    print("prohibited_body_text_headers_absent: PASS")
    print("category_and_action_fields_present: PASS")
    print("secret_patterns_absent: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
