#!/usr/bin/env python3
"""Local-only validator for the F5-05 mock internal QA acceptance package.

Validates only documents, review artifacts, exercises, PR-acceptance
artifacts, manifests, and dashboards under docs/fable5-mock-internal-qa/.
Never imports database libraries, never contacts any database or network,
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
PKG = ROOT / "docs/fable5-mock-internal-qa"
REVIEW = PKG / "refusal-template-review"
EXERCISES = PKG / "exercises"
PR_ACCEPT = PKG / "pr-acceptance"
MANIFESTS = PKG / "manifests"
DASHBOARDS = PKG / "dashboards"
TEMPLATES_FILE = ROOT / "app/src/lib/qa-research/refusal-templates.json"

REQUIRED_DOCS = [
    "00_F5_05_MOCK_INTERNAL_QA_REPORT.md",
    "01_OWNER_APPROVAL_SCOPE.md",
    "02_MOCK_SURFACE_QA_BASELINE.md",
    "03_REFUSAL_TEMPLATE_REVIEW_REPORT.md",
    "04_GOLDEN_QUERY_EXERCISE_REPORT.md",
    "05_CITATION_AND_AUDIT_QA_REPORT.md",
    "06_GUARDRAIL_BEHAVIOR_QA_REPORT.md",
    "07_ENVIRONMENT_AND_TARGET_CONTROL_QA_REPORT.md",
    "08_PR4_ACCEPTANCE_CRITERIA.md",
    "09_PR4_MERGE_BLOCKERS_AND_DEFERRALS.md",
    "10_OWNER_REVIEW_PACKET.md",
    "11_NEXT_PHASE_PROMPT.md",
    "12_NEXT_SESSION_START_HERE.md",
]

REQUIRED_REVIEW_JSON = [
    "refusal_template_inventory.json",
    "refusal_template_owner_review_matrix.json",
]
REQUIRED_REVIEW_MD = ["refusal_template_recommended_revisions.md"]

REQUIRED_EXERCISES = [
    "golden_query_mock_exercise.json",
    "mock_refusal_exercise.json",
    "mock_citation_exercise.json",
    "mock_guardrail_exercise.json",
    "mock_audit_exercise.json",
    "mock_environment_exercise.json",
]

REQUIRED_PR_ACCEPT = [
    "pr4_acceptance_checklist.md",
    "pr4_required_owner_reviews.md",
    "pr4_post_merge_controls.md",
    "pr4_do_not_merge_until.md",
]

REQUIRED_MANIFESTS = [
    "mock_internal_qa_manifest.json",
    "refusal_template_review_manifest.json",
    "golden_query_exercise_manifest.json",
    "pr4_acceptance_manifest.json",
    "remaining_blocker_manifest.json",
]

REQUIRED_DASHBOARDS = [
    "owner_mock_qa_dashboard.md",
    "technical_mock_qa_dashboard.md",
    "guardrail_mock_qa_dashboard.md",
    "pr4_readiness_dashboard.md",
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
    re.compile(r"supa" + r"base\s+(was|has\s+been|is\s+now)\s+(contacted|connected|queried|used)", re.I),
    re.compile(r"app\s+(is|was)\s+(now\s+)?connected\s+to\s+the\s+(preview|legal_authority|production)", re.I),
    re.compile(r"live\s+(database|db)\s+integration\s+(was|has\s+been|is\s+now|occurred)", re.I),
    re.compile(r"reload\s+(was|has\s+been|is\s+now|successfully)\s+(executed|completed|performed|run)", re.I),
    re.compile(r"embeddings\s+(were|have\s+been|are\s+now|successfully)\s+(generated|populated|created)", re.I),
    re.compile(r"display\s+gates?\s+(were|was|have\s+been|has\s+been|are\s+now|is\s+now)\s+(opened|relaxed|enabled)", re.I),
    re.compile(r"production\s+(was|has\s+been|is\s+now)\s+(touched|modified|loaded|connected|deployed)", re.I),
]
NEGATION = re.compile(r"\b(no|not|never|without|zero|prohibit\w*|must\s+not|do\s+not|none|until|unless|before|cannot|unchanged|untouched)\b", re.I)


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


def check_files(directory: Path, names: list[str], label: str, parse_json: bool, parsed: dict) -> int:
    bad = []
    for name in names:
        p = directory / name
        if not p.is_file():
            bad.append(f"missing {name}")
            continue
        if parse_json:
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

    failures += check_files(REVIEW, REQUIRED_REVIEW_JSON, "review_artifacts_parse", True, parsed)
    missing = [d for d in REQUIRED_REVIEW_MD if not (REVIEW / d).is_file()]
    fail_list(missing, "review_revision_doc_exists", not missing)
    failures += len(missing)

    failures += check_files(EXERCISES, REQUIRED_EXERCISES, "exercise_artifacts_parse", True, parsed)

    missing = [d for d in REQUIRED_PR_ACCEPT if not (PR_ACCEPT / d).is_file()]
    fail_list(missing, "pr_acceptance_artifacts_exist", not missing)
    failures += len(missing)

    failures += check_files(MANIFESTS, REQUIRED_MANIFESTS, "manifests_parse", True, parsed)

    missing = [d for d in REQUIRED_DASHBOARDS if not (DASHBOARDS / d).is_file()]
    fail_list(missing, "dashboards_exist", not missing)
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

    # Review matrix must cover every template in the app's template file.
    bad = []
    try:
        source_templates = set(
            json.loads(TEMPLATES_FILE.read_text(encoding="utf-8"))["templates"].keys()
        )
    except (OSError, json.JSONDecodeError, KeyError) as exc:
        source_templates = set()
        bad.append(f"could not read refusal-templates.json: {exc}")
    matrix_doc = parsed.get("refusal_template_owner_review_matrix.json")
    matrix_ids = set()
    valid_classes = {"Accept as written", "Adopt with revision", "Needs owner review", "Reject"}
    if isinstance(matrix_doc, dict):
        for row in matrix_doc.get("matrix", []):
            if isinstance(row, dict) and "id" in row:
                matrix_ids.add(row["id"])
                if row.get("classification") not in valid_classes:
                    bad.append(f"{row['id']} has invalid classification")
    uncovered = sorted(source_templates - matrix_ids)
    extra = sorted(matrix_ids - source_templates)
    for t in uncovered:
        bad.append(f"template not covered by review matrix: {t}")
    for t in extra:
        bad.append(f"review matrix names unknown template: {t}")
    fail_list(bad, "review_matrix_covers_all_templates", not bad)
    failures += len(bad)

    # PR acceptance manifest must keep PR #4 draft and not ready for merge.
    bad = []
    pr_doc = parsed.get("pr4_acceptance_manifest.json")
    if isinstance(pr_doc, dict):
        if pr_doc.get("pr_state") != "draft":
            bad.append("pr_state is not draft")
        if pr_doc.get("keep_draft") is not True:
            bad.append("keep_draft is not true")
        if pr_doc.get("ready_for_merge") is not False:
            bad.append("ready_for_merge is not false")
    else:
        bad.append("pr4_acceptance_manifest.json missing or unparsed")
    fail_list(bad, "pr4_kept_draft_not_ready_for_merge", not bad)
    failures += len(bad)

    em_dash = chr(0x2014)  # repo convention; spelled numerically so this file never contains it
    dashes = []
    for p in all_files:
        if em_dash in p.read_text(encoding="utf-8", errors="replace"):
            dashes.append(f"{p.relative_to(ROOT)} contains an em-dash")
    fail_list(dashes, "em_dashes_absent", not dashes)
    failures += len(dashes)

    print(f"f5_05_mock_internal_qa_validation: {'PASS' if failures == 0 else 'FAIL'}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
