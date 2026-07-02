#!/usr/bin/env python3
"""Local-only validator for the F5-04 mock-only app implementation.

Validates the mock implementation files, docs, and manifests. Never
imports database libraries, never contacts any database or network,
never reads source PDFs. Prints concise pass/fail output and exits 1 on
any failure.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / "docs/fable5-mock-app-implementation"
MANIFESTS = PKG / "manifests"
LIB = ROOT / "app/src/lib/qa-research"
ROUTE = ROOT / "app/src/app/api/qa-research/route.ts"
PAGE = ROOT / "app/src/app/(dashboard)/qa-research/page.tsx"
TESTS = ROOT / "app/src/__tests__/qa-research"

REQUIRED_DOCS = [
    "00_F5_04_MOCK_APP_IMPLEMENTATION_REPORT.md",
    "01_OWNER_APPROVAL_SCOPE.md",
    "02_IMPLEMENTED_FILE_MAP.md",
    "03_MOCK_RETRIEVAL_SERVICE_IMPLEMENTATION.md",
    "04_MOCK_GUARDRAIL_AND_REFUSAL_IMPLEMENTATION.md",
    "05_MOCK_CITATION_VALIDATION_IMPLEMENTATION.md",
    "06_MOCK_AUDIT_LOGGING_IMPLEMENTATION.md",
    "07_MOCK_ENVIRONMENT_TARGET_CONTROL.md",
    "08_TEST_RESULTS_AND_COVERAGE.md",
    "09_NO_LIVE_DATABASE_ATTESTATION.md",
    "10_RISK_REGISTER_AFTER_IMPLEMENTATION.md",
    "11_NEXT_PHASE_PROMPT.md",
    "12_NEXT_SESSION_START_HERE.md",
]

REQUIRED_MANIFESTS = [
    "implemented_file_manifest.json",
    "mock_contract_manifest.json",
    "test_result_manifest.json",
    "guardrail_coverage_manifest.json",
    "forbidden_path_scan_manifest.json",
]

REQUIRED_LIB_FILES = [
    "types.ts",
    "environment.ts",
    "retrieval-adapter.ts",
    "mock-retrieval-adapter.ts",
    "mock-fixtures.json",
    "guardrail.ts",
    "guardrail-patterns.json",
    "refusals.ts",
    "refusal-templates.json",
    "citation-verifier.ts",
    "audit-logger.ts",
    "mock-audit-logger.ts",
    "model-client.ts",
    "mock-model-client.ts",
    "prompt-contract.ts",
    "route-handler.ts",
]

REQUIRED_TEST_FILES = [
    "scenario-sync.test.ts",
    "qa-boot-checks.test.ts",
    "qa-route-static-safety.test.ts",
    "qa-route-retrieval.test.ts",
    "qa-route-refusals.test.ts",
    "qa-route-citations.test.ts",
    "qa-route-guardrails.test.ts",
    "qa-route-audit.test.ts",
    "qa-route-environment.test.ts",
]

# Files the F5-04 diff must NOT contain (categories from the owner prompt).
FORBIDDEN_CHANGE_PREFIXES = [
    "supabase/",
    "scripts/database_load/",
    "scripts/ingestion",
    "scripts/source_manifest/",
    "scripts/metadata_qa/",
    "data/ingestion-expanded/",
    "data/source-manifest/",
    "app/wrangler.toml",
    "app/src/lib/supabase/",
    "app/src/app/api/chat/",
    "app/src/app/(dashboard)/chat/",
    "app/src/lib/scope-guard.ts",
    "app/src/lib/citation-validator.ts",
    "app/src/lib/hallucination-guard.ts",
    "app/src/lib/corpus-coverage.ts",
    "app/src/lib/query-router.ts",
    "app/src/lib/legal-corpus-data.json",
    "app/package-lock.json",
    "package-lock.json",
]

# Secret-shaped patterns assembled by concatenation so this file never
# contains the literal trigger strings that repo-wide guardrail greps
# look for.
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

# Live-path tokens forbidden in the mock implementation graph (spliced).
_LIVE_PARTS = [
    ("mock supa" "base import", "@sup", "abase"),
    ("client creation call", "create", "Client("),
    ("supa" "base env naming", "SUPA", "BASE_"),
    ("database url env", "DATABASE", "_URL"),
    ("postgres scheme", "postgres", "://"),
    ("service role naming", "service", "_role"),
    ("embeddings call", "embed", "ding"),
    ("axios client", "ax", "ios"),
    ("open" "ai client", "open", "ai."),
    ("live model sdk", "@anthropic", "-ai/sdk"),
    ("external fetch dq", 'fetch("', "http"),
    ("external fetch sq", "fetch('", "http"),
    ("web search phrase", "web ", "search"),
]
LIVE_TOKENS = [(parts[0], "".join(parts[1:])) for parts in _LIVE_PARTS]

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
    re.compile(r"app\s+(is|was)\s+(now\s+)?connected\s+to\s+the\s+(preview|legal_authority|production)", re.I),
    re.compile(r"reload\s+(was|has\s+been|is\s+now|successfully)\s+(executed|completed|performed|run)", re.I),
    re.compile(r"embeddings\s+(were|have\s+been|are\s+now|successfully)\s+(generated|populated|created)", re.I),
    re.compile(r"display\s+gates?\s+(were|was|have\s+been|has\s+been|are\s+now|is\s+now)\s+(opened|relaxed|enabled)", re.I),
    re.compile(r"production\s+(was|has\s+been|is\s+now)\s+(touched|modified|loaded|connected|deployed)", re.I),
    re.compile(r"live\s+(database|retrieval|adapter)\s+(was|has\s+been|is\s+now)\s+(added|implemented|connected|enabled)", re.I),
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


def mock_graph_files() -> list[Path]:
    files = [ROUTE, PAGE]
    files += sorted(LIB.glob("*"))
    return [f for f in files if f.is_file()]


def main() -> int:
    failures = 0

    missing = [d for d in REQUIRED_DOCS if not (PKG / d).is_file()]
    fail_list(missing, "required_docs_exist", not missing)
    failures += len(missing)

    bad = []
    parsed: dict[str, object] = {}
    for name in REQUIRED_MANIFESTS:
        p = MANIFESTS / name
        if not p.is_file():
            bad.append(f"missing {name}")
            continue
        try:
            parsed[name] = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            bad.append(f"unparseable {name}: {exc}")
    fail_list(bad, "required_manifests_parse", not bad)
    failures += len(bad)

    missing = [f for f in REQUIRED_LIB_FILES if not (LIB / f).is_file()]
    if not ROUTE.is_file():
        missing.append("api route")
    if not PAGE.is_file():
        missing.append("qa page")
    fail_list(missing, "mock_implementation_files_exist", not missing)
    failures += len(missing)

    missing = [f for f in REQUIRED_TEST_FILES if not (TESTS / f).is_file()]
    scenario_copies = sorted((TESTS / "scenarios").glob("*.json"))
    if len(scenario_copies) != 6:
        missing.append(f"expected 6 scenario copies, found {len(scenario_copies)}")
    fail_list(missing, "test_files_exist", not missing)
    failures += len(missing)

    # Secret patterns absent from F5-04 docs, validator dir, and the graph.
    scan_files = sorted(p for p in PKG.rglob("*") if p.is_file()) + mock_graph_files()
    hits = []
    for p in scan_files:
        text = p.read_text(encoding="utf-8", errors="replace")
        for pat in SECRET_PATTERNS:
            if pat.search(text):
                hits.append(f"{p.relative_to(ROOT)} matches {pat.pattern[:24]}...")
    fail_list(hits, "secret_patterns_absent", not hits)
    failures += len(hits)

    # Live-path tokens absent from the mock implementation graph.
    hits = []
    for p in mock_graph_files():
        text = p.read_text(encoding="utf-8", errors="replace").lower()
        for name, token in LIVE_TOKENS:
            if token.lower() in text:
                hits.append(f"{p.relative_to(ROOT)}: {name}")
    fail_list(hits, "mock_graph_live_paths_absent", not hits)
    failures += len(hits)

    # MOCK_ONLY declaration present.
    bad = []
    env_text = (LIB / "environment.ts").read_text(encoding="utf-8") if (LIB / "environment.ts").is_file() else ""
    types_text = (LIB / "types.ts").read_text(encoding="utf-8") if (LIB / "types.ts").is_file() else ""
    if "MOCK_ONLY" not in (env_text + types_text):
        bad.append("MOCK_ONLY label not declared in environment/types modules")
    if 'ENVIRONMENT_LABEL = "MOCK_ONLY"' not in types_text:
        bad.append("ENVIRONMENT_LABEL constant missing")
    fail_list(bad, "mock_only_declared", not bad)
    failures += len(bad)

    # Fixture discipline: synthetic markers, no excluded-title authorities.
    bad = []
    fixtures_path = LIB / "mock-fixtures.json"
    if fixtures_path.is_file():
        fixtures = json.loads(fixtures_path.read_text(encoding="utf-8"))
        for chunk in fixtures.get("chunks", []):
            if chunk.get("synthetic") is not True:
                bad.append(f"{chunk.get('authority_chunk_id')} missing synthetic=true")
            if "SYNTHETIC" not in chunk.get("canonical_citation", ""):
                bad.append(f"{chunk.get('authority_chunk_id')} citation lacks SYNTHETIC marker")
        fx_text = fixtures_path.read_text(encoding="utf-8")
        if re.search(r"\b(39|40|55)-\d{1,3}-\d{1,4}\b", fx_text):
            bad.append("fixtures contain an excluded-title citation shape")
        if re.search(r'"authority_family"\s*:\s*"tca_title_(39|40|55)"', fx_text):
            bad.append("fixtures contain an excluded-title family")
    else:
        bad.append("mock-fixtures.json missing")
    fail_list(bad, "fixtures_synthetic_and_in_universe", not bad)
    failures += len(bad)

    # Required behavior tests exist (by content probe).
    bad = []
    probes = {
        "qa-route-refusals.test.ts": ["RF-02", "RF-03", "RF-04", "excluded_title"],
        "qa-route-citations.test.ts": ["T-CIT-MISSING", "citation_validation_failure"],
        "qa-route-guardrails.test.ts": ["ruling_recommendation", "credibility_evaluation", "extra_record_facts"],
        "qa-route-audit.test.ts": ["MA-01", "MA-07"],
        "qa-route-environment.test.ts": ["MOCK ONLY", "target_control"],
        "qa-route-static-safety.test.ts": ["forbidden", "SYNTHETIC"],
        "qa-route-retrieval.test.ts": ["MR-07", "no_authority_support"],
    }
    for fname, needles in probes.items():
        p = TESTS / fname
        if not p.is_file():
            bad.append(f"missing {fname}")
            continue
        text = p.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                bad.append(f"{fname} lacks expected probe {needle}")
    fail_list(bad, "required_behavior_tests_present", not bad)
    failures += len(bad)

    # No prohibited body-text fields in F5-04 JSON/CSV artifacts.
    bad = []
    for p in sorted(PKG.rglob("*")):
        if not p.is_file():
            continue
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

    # No prohibited action claims in the docs.
    claims = []
    for p in sorted(PKG.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in (".md", ".json", ".txt"):
            continue
        for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
            for pat in CLAIM_PATTERNS:
                if pat.search(line) and not NEGATION.search(line):
                    claims.append(f"{p.relative_to(ROOT)}: {line.strip()[:80]}")
    fail_list(claims, "no_prohibited_action_claims", not claims)
    failures += len(claims)

    # Changed files (vs the base branch) avoid forbidden categories.
    bad = []
    import subprocess

    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "diff", "--name-only", "refactor/codex-gpt55-launch-prep...HEAD"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.splitlines()
        status = subprocess.run(
            ["git", "-C", str(ROOT), "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.splitlines()
        pending = [line[3:].split(" -> ")[-1] for line in status if line.strip()]
        changed = set(out) | set(pending)
        # Python bytecode caches are run artifacts, not source changes.
        changed = {p for p in changed if "__pycache__" not in p}
        for path in sorted(changed):
            for prefix in FORBIDDEN_CHANGE_PREFIXES:
                if path.startswith(prefix):
                    bad.append(f"forbidden path changed: {path}")
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        bad.append(f"git diff unavailable: {exc}")
    fail_list(bad, "changed_files_avoid_forbidden_paths", not bad)
    failures += len(bad)

    em_dash = chr(0x2014)  # repo convention; spelled numerically so this file never contains it
    dashes = []
    for p in sorted(PKG.rglob("*")):
        if p.is_file() and em_dash in p.read_text(encoding="utf-8", errors="replace"):
            dashes.append(f"{p.relative_to(ROOT)} contains an em-dash")
    fail_list(dashes, "em_dashes_absent", not dashes)
    failures += len(dashes)

    print(f"f5_04_mock_app_implementation_validation: {'PASS' if failures == 0 else 'FAIL'}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
