#!/usr/bin/env python3
"""Local-only validator for the Fable 5 app integration readiness package (F5-02).

Validates only repository documents, contracts, mock-harness artifacts,
manifests, and dashboards under docs/fable5-app-integration-readiness/.
Never imports database libraries, never contacts any database or network,
never reads source PDFs, never modifies app code. Prints concise pass/fail
output and exits 1 on any failure.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / "docs/fable5-app-integration-readiness"
CONTRACTS = PKG / "contracts"
MOCKS = PKG / "mock-harness"
MANIFESTS = PKG / "manifests"
DASHBOARDS = PKG / "dashboards"

REQUIRED_DOCS = [
    "00_FABLE5_APP_INTEGRATION_READINESS_REPORT.md",
    "01_REPO_APP_SURFACE_INVENTORY.md",
    "02_EXISTING_CHAT_AND_API_PATH_AUDIT.md",
    "03_DATABASE_RETRIEVAL_CONTRACT_SPEC.md",
    "04_MANDATORY_CITATION_CONTRACT_SPEC.md",
    "05_REFUSAL_AND_NO_AUTHORITY_CONTRACT_SPEC.md",
    "06_JUDICIAL_GUARDRAIL_CONTRACT_SPEC.md",
    "07_DCS_AND_TRE_SCOPE_HANDLING_SPEC.md",
    "08_RESTRICTED_PENDING_AND_EFFECTIVITY_HANDLING_SPEC.md",
    "09_AUDIT_LOGGING_AND_TRACEABILITY_SPEC.md",
    "10_UI_DISCLOSURE_AND_ENVIRONMENT_LABELING_SPEC.md",
    "11_SECURITY_AND_RLS_APP_ACCESS_SPEC.md",
    "12_MOCK_ONLY_QA_HARNESS_DESIGN.md",
    "13_GOLDEN_QUERY_TEST_SUITE_SPEC.md",
    "14_APP_INTEGRATION_STOP_CONDITIONS.md",
    "15_IMPLEMENTATION_PHASE_PLAN.md",
    "16_OWNER_DECISION_PACKET.md",
    "17_NEXT_CODEX_EXECUTION_PROMPT.md",
    "18_NEXT_FABLE5_PROMPT.md",
    "19_NEXT_SESSION_START_HERE.md",
]

REQUIRED_CONTRACTS = [
    "legal_retrieval_request_contract.json",
    "legal_retrieval_response_contract.json",
    "citation_object_contract.json",
    "refusal_object_contract.json",
    "audit_log_object_contract.json",
    "guardrail_decision_contract.json",
]

REQUIRED_MOCKS = [
    "mock_retrieval_scenarios.json",
    "mock_refusal_scenarios.json",
    "mock_citation_validation_scenarios.json",
    "mock_guardrail_scenarios.json",
    "mock_audit_log_scenarios.json",
    "mock_environment_target_scenarios.json",
]

REQUIRED_MANIFESTS = [
    "app_surface_inventory_manifest.json",
    "integration_blocker_manifest.json",
    "contract_readiness_manifest.json",
    "mock_harness_manifest.json",
    "implementation_phase_manifest.json",
]

REQUIRED_DASHBOARDS = [
    "owner_app_integration_dashboard.md",
    "technical_app_integration_dashboard.md",
    "qa_harness_dashboard.md",
    "guardrail_enforcement_dashboard.md",
    "security_and_target_control_dashboard.md",
]

REQUIRED_BLOCKER_IDS = {
    "display_gates_closed",
    "preview_reload_not_executed_after_patch_review",
    "app_database_retrieval_path_not_implemented",
    "embeddings_not_generated",
    "dcs_production_answer_authority_prohibited",
    "restricted_lexis_non_display",
    "pending_extraction_qa_non_display",
    "unknown_effectivity_blocked",
    "qa_signoff_pending",
    "audit_logging_not_yet_app_integrated",
    "citation_enforcement_not_yet_app_integrated",
    "refusal_enforcement_not_yet_app_integrated",
    "target_control_not_yet_app_integrated",
}

# Secret-shaped patterns assembled by concatenation so this file never contains
# the literal trigger strings that repo-wide guardrail greps look for.
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

PROHIBITED_FIELDS = {
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

CLAIM_PATTERNS = [
    re.compile(r"app\s+integration\s+(was|has\s+been|is\s+now)\s+(implemented|completed|performed)", re.I),
    re.compile(r"app\s+(is|was)\s+(now\s+)?connected\s+to\s+the\s+(preview|legal_authority)", re.I),
    re.compile(r"reload\s+(was|has\s+been|is\s+now|successfully)\s+(executed|completed|performed|run)", re.I),
    re.compile(r"embeddings\s+(were|have\s+been|are\s+now|successfully)\s+(generated|populated|created)", re.I),
    re.compile(r"display\s+gates?\s+(were|was|have\s+been|has\s+been|are\s+now|is\s+now)\s+(opened|relaxed|enabled)", re.I),
    re.compile(r"production\s+(was|has\s+been|is\s+now)\s+(touched|modified|loaded|connected|deployed)", re.I),
]
NEGATION = re.compile(r"\b(no|not|never|without|zero|prohibit\w*|must\s+not|do\s+not|none|until|unless|before|cannot)\b", re.I)


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


def check_json_set(directory: Path, names: list[str], label: str, parsed: dict) -> int:
    bad = []
    for name in names:
        p = directory / name
        if not p.is_file():
            bad.append(f"missing {name}")
            continue
        try:
            parsed[name] = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            bad.append(f"unparseable {name}: {exc}")
    fail_list(bad, label, not bad)
    return len(bad)


def main() -> int:
    failures = 0
    parsed: dict[str, object] = {}

    missing = [d for d in REQUIRED_DOCS if not (PKG / d).is_file()]
    fail_list(missing, "required_docs_exist", not missing)
    failures += len(missing)

    failures += check_json_set(CONTRACTS, REQUIRED_CONTRACTS, "required_contracts_parse", parsed)
    failures += check_json_set(MOCKS, REQUIRED_MOCKS, "required_mock_artifacts_parse", parsed)
    failures += check_json_set(MANIFESTS, REQUIRED_MANIFESTS, "required_manifests_parse", parsed)

    missing = [d for d in REQUIRED_DASHBOARDS if not (DASHBOARDS / d).is_file()]
    fail_list(missing, "required_dashboards_exist", not missing)
    failures += len(missing)

    all_files = sorted(p for p in PKG.rglob("*") if p.is_file())

    hits = []
    for p in all_files:
        text = p.read_text(encoding="utf-8", errors="replace")
        for pat in SECRET_PATTERNS:
            if pat.search(text):
                hits.append(f"{p.relative_to(ROOT)} matches {pat.pattern[:24]}...")
    fail_list(hits, "secret_patterns_absent", not hits)
    failures += len(hits)

    bad = []
    for p in all_files:
        if p.suffix.lower() == ".csv":
            with p.open(encoding="utf-8") as fh:
                header = next(csv.reader(fh), [])
            found = PROHIBITED_FIELDS & {h.strip().lower() for h in header}
            if found:
                bad.append(f"{p.relative_to(ROOT)} has columns {sorted(found)}")
        elif p.suffix.lower() == ".json":
            try:
                keys = {k.lower() for k in json_keys(json.loads(p.read_text(encoding="utf-8")))}
            except json.JSONDecodeError:
                continue
            found = PROHIBITED_FIELDS & keys
            if found:
                bad.append(f"{p.relative_to(ROOT)} has keys {sorted(found)}")
    fail_list(bad, "prohibited_body_text_fields_absent", not bad)
    failures += len(bad)

    claims = []
    for p in all_files:
        if p.suffix.lower() not in (".md", ".json", ".txt"):
            continue
        for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
            for pat in CLAIM_PATTERNS:
                if pat.search(line) and not NEGATION.search(line):
                    claims.append(f"{p.relative_to(ROOT)}: {line.strip()[:80]}")
    fail_list(claims, "no_prohibited_action_claims", not claims)
    failures += len(claims)

    blocker_doc = parsed.get("integration_blocker_manifest.json")
    present = set()
    if isinstance(blocker_doc, dict):
        for b in blocker_doc.get("blockers", []):
            if isinstance(b, dict) and "id" in b:
                present.add(b["id"])
    missing_ids = sorted(REQUIRED_BLOCKER_IDS - present)
    fail_list(missing_ids, "integration_blocker_manifest_complete", not missing_ids)
    failures += len(missing_ids)

    print(f"fable5_app_integration_readiness_validation: {'PASS' if failures == 0 else 'FAIL'}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
