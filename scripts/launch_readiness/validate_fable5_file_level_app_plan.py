#!/usr/bin/env python3
"""Local-only validator for the Fable 5 file-level app plan package (F5-03).

Validates only repository documents, file maps, mock-backend design
contracts, test plans, manifests, and dashboards under
docs/fable5-file-level-app-plan/. Never imports database libraries, never
contacts any database or network, never reads source PDFs, never modifies
app code. Prints concise pass/fail output and exits 1 on any failure.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / "docs/fable5-file-level-app-plan"
FILE_MAPS = PKG / "file-maps"
MOCK_DESIGN = PKG / "mock-backend-design"
TEST_PLAN = PKG / "test-plan"
MANIFESTS = PKG / "manifests"
DASHBOARDS = PKG / "dashboards"

REQUIRED_DOCS = [
    "00_FABLE5_FILE_LEVEL_APP_PLAN_REPORT.md",
    "01_OWNER_APPROVAL_SCOPE.md",
    "02_REPO_APP_FILE_INVENTORY.md",
    "03_CURRENT_APP_ARCHITECTURE_FINDINGS.md",
    "04_FILE_LEVEL_IMPLEMENTATION_MAP.md",
    "05_MOCK_BACKEND_DESIGN.md",
    "06_CONTRACT_VALIDATION_DESIGN.md",
    "07_UI_GUARDRAIL_AND_REFUSAL_FLOW_DESIGN.md",
    "08_CITATION_RENDERING_AND_VALIDATION_DESIGN.md",
    "09_AUDIT_LOGGING_FLOW_DESIGN.md",
    "10_TARGET_ENVIRONMENT_CONTROL_DESIGN.md",
    "11_TEST_HARNESS_FILE_LEVEL_PLAN.md",
    "12_NO_LIVE_DATABASE_ENFORCEMENT_PLAN.md",
    "13_SECURITY_AND_SECRET_ABSENCE_PLAN.md",
    "14_APP_CODE_CHANGE_RISK_REGISTER.md",
    "15_MOCK_ONLY_IMPLEMENTATION_SEQUENCE.md",
    "16_OWNER_DECISION_PACKET.md",
    "17_NEXT_CODEX_MOCK_IMPLEMENTATION_PROMPT.md",
    "18_NEXT_FABLE5_PROMPT.md",
    "19_NEXT_SESSION_START_HERE.md",
]

REQUIRED_FILE_MAPS = [
    "existing_app_file_inventory.json",
    "future_mock_only_files_to_create.json",
    "future_mock_only_files_to_modify.json",
    "files_forbidden_until_live_db_phase.json",
    "test_file_plan.json",
]

REQUIRED_MOCK_DESIGNS = [
    "mock_legal_retrieval_route_contract.json",
    "mock_legal_retrieval_service_contract.json",
    "mock_guardrail_service_contract.json",
    "mock_citation_validator_contract.json",
    "mock_audit_logger_contract.json",
    "mock_environment_label_contract.json",
    "mock_fixture_design.json",
]

REQUIRED_TEST_PLANS = [
    "mock_retrieval_tests.json",
    "mock_refusal_tests.json",
    "mock_citation_tests.json",
    "mock_guardrail_tests.json",
    "mock_audit_log_tests.json",
    "mock_environment_target_tests.json",
    "excluded_scope_tests.json",
    "no_general_fallback_tests.json",
]

REQUIRED_MANIFESTS = [
    "file_level_plan_manifest.json",
    "mock_implementation_readiness_manifest.json",
    "app_code_risk_manifest.json",
    "mock_test_coverage_manifest.json",
    "owner_decision_manifest.json",
]

REQUIRED_DASHBOARDS = [
    "owner_mock_implementation_dashboard.md",
    "technical_file_level_dashboard.md",
    "qa_mock_harness_dashboard.md",
    "guardrail_file_level_dashboard.md",
    "risk_and_stop_condition_dashboard.md",
]

REQUIRED_FORBIDDEN_CATEGORIES = {
    "migrations",
    "loader_scripts",
    "ingestion_scripts",
    "source_pdfs",
    "generated_corpus_sources",
    "live_database_connection_files",
    "production_target_config",
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
    re.compile(r"app\s+(code|integration)\s+(was|has\s+been|is\s+now)\s+(implemented|completed|modified|changed|written)", re.I),
    re.compile(r"(route|page|module)s?\s+(was|were|has\s+been|have\s+been)\s+(implemented|created|written)\s+under\s+app/", re.I),
    re.compile(r"mock\s+backend\s+(was|has\s+been|is\s+now)\s+(implemented|built|wired|created)", re.I),
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

    failures += check_json_set(FILE_MAPS, REQUIRED_FILE_MAPS, "required_file_maps_parse", parsed)
    failures += check_json_set(MOCK_DESIGN, REQUIRED_MOCK_DESIGNS, "required_mock_designs_parse", parsed)
    failures += check_json_set(TEST_PLAN, REQUIRED_TEST_PLANS, "required_test_plans_parse", parsed)
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

    em_dash = chr(0x2014)  # repo convention forbids this character; spelled numerically so this file never contains it
    dashes = []
    for p in all_files:
        text = p.read_text(encoding="utf-8", errors="replace")
        if em_dash in text:
            dashes.append(f"{p.relative_to(ROOT)} contains an em-dash")
    fail_list(dashes, "em_dashes_absent", not dashes)
    failures += len(dashes)

    modify_map = parsed.get("future_mock_only_files_to_modify.json")
    bad = []
    if isinstance(modify_map, dict):
        entries = modify_map.get("files", [])
        if not entries:
            bad.append("modify map has no files entries")
        for e in entries:
            if not isinstance(e, dict) or e.get("f5_03_status") != "not_modified_in_f5_03":
                bad.append(f"entry {e.get('path', '?') if isinstance(e, dict) else e} not marked not_modified_in_f5_03")
    else:
        bad.append("modify map missing or unparsed")
    fail_list(bad, "modify_map_fully_deferred", not bad)
    failures += len(bad)

    forbidden_map = parsed.get("files_forbidden_until_live_db_phase.json")
    present = set()
    if isinstance(forbidden_map, dict):
        for c in forbidden_map.get("categories", []):
            if isinstance(c, dict) and "category" in c:
                present.add(c["category"])
    missing_cats = sorted(REQUIRED_FORBIDDEN_CATEGORIES - present)
    fail_list(missing_cats, "forbidden_map_categories_complete", not missing_cats)
    failures += len(missing_cats)

    create_map = parsed.get("future_mock_only_files_to_create.json")
    bad = []
    if isinstance(create_map, dict):
        files = create_map.get("files", [])
        if create_map.get("count") != len(files):
            bad.append(f"count field {create_map.get('count')} != {len(files)} entries")
        if create_map.get("status") != "plan_only_nothing_created_in_f5_03":
            bad.append("create map status is not plan_only_nothing_created_in_f5_03")
    else:
        bad.append("create map missing or unparsed")
    fail_list(bad, "create_map_consistent_and_plan_only", not bad)
    failures += len(bad)

    bad = []
    for name, doc in parsed.items():
        if isinstance(doc, dict):
            if doc.get("metadata_only") is not True:
                bad.append(f"{name} missing metadata_only=true")
            if doc.get("body_text_included") is not False:
                bad.append(f"{name} missing body_text_included=false")
    fail_list(bad, "json_artifacts_declare_metadata_only", not bad)
    failures += len(bad)

    print(f"fable5_file_level_app_plan_validation: {'PASS' if failures == 0 else 'FAIL'}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
