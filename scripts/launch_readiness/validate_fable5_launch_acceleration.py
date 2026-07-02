#!/usr/bin/env python3
"""Local-only validator for the Fable 5 launch acceleration package.

Validates repository documents, manifests, and local metadata artifacts only.
It never imports database libraries, never contacts any database or network,
and never reads source PDFs. Prints concise pass/fail output and exits 1 on
any failure.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / "docs/fable5-launch-acceleration"
MANIFESTS = PKG / "manifests"
DASHBOARDS = PKG / "dashboards"

REQUIRED_DOCS = [
    "00_FABLE5_LAUNCH_ACCELERATION_REPORT.md",
    "01_REPO_AND_PHASE_BASELINE.md",
    "02_CLOSED_UNIVERSE_ARCHITECTURE_AUDIT.md",
    "03_LEGAL_RAG_DATABASE_AND_RETRIEVAL_AUDIT.md",
    "04_CITATION_INTEGRITY_AND_ALIAS_AUDIT.md",
    "05_METADATA_REMEDIATION_STATUS_AND_NEXT_ACTIONS.md",
    "06_PREVIEW_RELOAD_READINESS_AUDIT.md",
    "07_APP_INTEGRATION_DEFERRAL_AND_REQUIRED_CONTRACT.md",
    "08_INTERNAL_QA_LAUNCH_READINESS_SCORECARD.md",
    "09_JUDICIAL_GUARDRAIL_IMPLEMENTATION_SPEC.md",
    "10_REFUSAL_AND_NO_AUTHORITY_TEST_MATRIX.md",
    "11_GOLDEN_QUERY_AND_CITATION_QA_PLAN.md",
    "12_SECURITY_RLS_AND_AUDIT_LOGGING_AUDIT.md",
    "13_PRODUCTION_PROHIBITION_AND_TARGET_CONTROL_PLAN.md",
    "14_PHASED_LAUNCH_RUNWAY_TO_INTERNAL_QA.md",
    "15_OWNER_DECISION_PACKET.md",
    "16_NEXT_CODEX_EXECUTION_PROMPT.md",
    "17_NEXT_CLAUDE_FABLE5_PROMPT.md",
    "18_NEXT_SESSION_START_HERE.md",
]

REQUIRED_DASHBOARDS = [
    "owner_launch_dashboard.md",
    "technical_launch_dashboard.md",
    "legal_rag_integrity_dashboard.md",
    "qa_and_guardrail_dashboard.md",
    "week_until_july_7_execution_dashboard.md",
]

REQUIRED_MANIFESTS = [
    "launch_blocker_manifest.json",
    "internal_qa_readiness_manifest.json",
    "required_owner_decisions_manifest.json",
    "safe_next_phase_manifest.json",
    "guardrail_test_manifest.json",
]

REQUIRED_BLOCKER_IDS = {
    "unresolved_identity",
    "unknown_effectivity",
    "qa_signoff_pending",
    "dcs_guardrail_only",
    "restricted_lexis_non_display",
    "pending_extraction_qa",
    "dcs_handbook_reconciliation",
    "embeddings_not_generated",
    "app_integration_not_implemented",
    "display_gates_closed",
    "preview_reload_not_executed_after_patch_review",
    "production_untouched",
    "migration_history_caveat",
    "judicial_guardrail_app_path",
}

ALLOWED_READINESS_STATUSES = {
    "Ready",
    "Ready after owner review",
    "Blocked",
    "Deferred",
    "Needs further review",
}

# Secret-shaped patterns. Assembled by concatenation so this file itself never
# contains the literal trigger strings that repo-wide guardrail greps look for.
_SECRET_PARTS = [
    ("BEG", "IN R", "SA"),
    ("BEG", "IN", r"\s+PRIV", "ATE", r"\s+KEY"),
    ("SUPABASE_", "ACCESS_", "TOKEN"),
    ("service", "_role"),
    ("postgresql", "://"),
    ("postgres", "://"),
    ("pass" "word", r"\s*="),
    ("Bea" "rer ",),
    ("ey" "J",),
    ("COPY ", ".*authority", "_chunks"),
]
SECRET_PATTERNS = [re.compile("".join(parts), re.IGNORECASE) for parts in _SECRET_PARTS]

PROHIBITED_COLUMNS = {
    "text",
    "chunk_text",
    "body",
    "body_text",
    "content",
    "excerpt",
    "source_text",
    "page_text",
    "ocr_text",
    "full_text",
    "raw_text",
}

# Affirmative claims that a prohibited action occurred. Lines carrying clear
# negation vocabulary are exempt (the package talks constantly about actions
# that did NOT happen).
CLAIM_PATTERNS = [
    re.compile(r"reload\s+(was|has\s+been|is\s+now|successfully)\s+(executed|completed|performed|run)", re.I),
    re.compile(r"embeddings\s+(were|have\s+been|are\s+now|successfully)\s+(generated|populated|created)", re.I),
    re.compile(r"app\s+integration\s+(was|has\s+been|is\s+now)\s+(implemented|completed|performed)", re.I),
    re.compile(r"app\s+(is|was)\s+(now\s+)?connected\s+to\s+the\s+(preview|legal_authority)", re.I),
    re.compile(r"display\s+gates?\s+(were|was|have\s+been|has\s+been|are\s+now|is\s+now)\s+(opened|relaxed|enabled)", re.I),
    re.compile(r"production\s+display\s+(was|has\s+been|is\s+now)\s+(enabled|opened|activated)", re.I),
]
NEGATION = re.compile(r"\b(no|not|never|without|zero|prohibit\w*|must\s+not|do\s+not|none|until|unless|before)\b", re.I)


def fail_list(failures: list[str], label: str, ok: bool) -> None:
    print(f"{label}: {'PASS' if ok else 'FAIL'}")
    if not ok:
        for f in failures[:10]:
            print(f"  - {f}")


def json_keys(obj) -> set[str]:
    keys: set[str] = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            keys.add(k)
            keys |= json_keys(v)
    elif isinstance(obj, list):
        for item in obj:
            keys |= json_keys(item)
    return keys


def main() -> int:
    failures_total = 0

    # 1. Required docs
    missing = [d for d in REQUIRED_DOCS if not (PKG / d).is_file()]
    fail_list(missing, "required_docs_exist", not missing)
    failures_total += len(missing)

    # 2. Required dashboards
    missing = [d for d in REQUIRED_DASHBOARDS if not (DASHBOARDS / d).is_file()]
    fail_list(missing, "required_dashboards_exist", not missing)
    failures_total += len(missing)

    # 3. Required manifests parse as JSON
    bad = []
    parsed: dict[str, object] = {}
    for m in REQUIRED_MANIFESTS:
        p = MANIFESTS / m
        if not p.is_file():
            bad.append(f"missing {m}")
            continue
        try:
            parsed[m] = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            bad.append(f"unparseable {m}: {exc}")
    fail_list(bad, "required_manifests_parse", not bad)
    failures_total += len(bad)

    all_files = sorted(p for p in PKG.rglob("*") if p.is_file())

    # 4. No secret patterns
    hits = []
    for p in all_files:
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            hits.append(f"unreadable {p.name}: {exc}")
            continue
        for pat in SECRET_PATTERNS:
            if pat.search(text):
                hits.append(f"{p.relative_to(ROOT)} matches {pat.pattern[:24]}...")
    fail_list(hits, "secret_patterns_absent", not hits)
    failures_total += len(hits)

    # 5. No prohibited body-text columns in CSV/JSON artifacts under the package
    bad = []
    for p in all_files:
        if p.suffix.lower() == ".csv":
            try:
                with p.open(encoding="utf-8") as fh:
                    header = next(csv.reader(fh), [])
            except OSError:
                header = []
            found = PROHIBITED_COLUMNS & {h.strip().lower() for h in header}
            if found:
                bad.append(f"{p.relative_to(ROOT)} has columns {sorted(found)}")
        elif p.suffix.lower() == ".json":
            try:
                keys = {k.lower() for k in json_keys(json.loads(p.read_text(encoding="utf-8")))}
            except (OSError, json.JSONDecodeError):
                continue  # parse failures already reported for manifests
            found = PROHIBITED_COLUMNS & keys
            if found:
                bad.append(f"{p.relative_to(ROOT)} has keys {sorted(found)}")
    fail_list(bad, "prohibited_body_text_columns_absent", not bad)
    failures_total += len(bad)

    # 6. No file claims a prohibited action occurred
    claims = []
    for p in all_files:
        if p.suffix.lower() not in (".md", ".json", ".txt"):
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        for line in text.splitlines():
            for pat in CLAIM_PATTERNS:
                if pat.search(line) and not NEGATION.search(line):
                    claims.append(f"{p.relative_to(ROOT)}: {line.strip()[:80]}")
    fail_list(claims, "no_prohibited_action_claims", not claims)
    failures_total += len(claims)

    # 7. Launch blocker manifest completeness
    blocker_doc = parsed.get("launch_blocker_manifest.json")
    present_ids = set()
    if isinstance(blocker_doc, dict):
        for b in blocker_doc.get("blockers", []):
            if isinstance(b, dict) and "id" in b:
                present_ids.add(b["id"])
    missing_ids = sorted(REQUIRED_BLOCKER_IDS - present_ids)
    fail_list(missing_ids, "launch_blocker_manifest_complete", not missing_ids)
    failures_total += len(missing_ids)

    # 8. Readiness manifest classification values
    bad = []
    readiness = parsed.get("internal_qa_readiness_manifest.json")
    if isinstance(readiness, dict):
        cats = readiness.get("categories", [])
        if not cats:
            bad.append("no categories present")
        for c in cats:
            status = c.get("status") if isinstance(c, dict) else None
            if status not in ALLOWED_READINESS_STATUSES:
                bad.append(f"category {c.get('id', '?')} has invalid status {status!r}")
    else:
        bad.append("readiness manifest not parsed")
    fail_list(bad, "readiness_statuses_valid", not bad)
    failures_total += len(bad)

    print(f"fable5_launch_acceleration_validation: {'PASS' if failures_total == 0 else 'FAIL'}")
    return 0 if failures_total == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
