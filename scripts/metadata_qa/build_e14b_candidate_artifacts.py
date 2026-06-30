#!/usr/bin/env python3
"""Build Phase E14-B local candidate remediation artifacts.

This script is local-only. It reads E13-A metadata review queues and E14-A
metadata templates, then writes candidate artifacts, manifests, dashboards, and
planning reports under docs/preview-corpus-e14b. It does not read source PDFs,
read generated corpus body files, contact any database, generate embeddings, or
modify active corpus, app, migration, loader, or ingestion paths.
"""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
E13_QUEUE_DIR = ROOT / "docs/preview-corpus-e13/review-queues"
E14_TEMPLATE_DIR = ROOT / "docs/preview-corpus-e14/draft-remediation-artifacts"
E14B_DIR = ROOT / "docs/preview-corpus-e14b"
ARTIFACT_DIR = E14B_DIR / "candidate-remediation-artifacts"
DASHBOARD_DIR = E14B_DIR / "dashboards"
MANIFEST_DIR = E14B_DIR / "manifests"

TODAY = date.today().isoformat()

BASE_ALLOWED_COLUMNS = [
    "artifact_type",
    "source_queue",
    "queue_category",
    "priority",
    "source_type",
    "authority_family",
    "source_file",
    "source_sha256",
    "source_path",
    "chunk_id",
    "authority_unit_id",
    "authority_version_id",
    "citation",
    "normalized_citation",
    "title",
    "rule_number",
    "section",
    "policy_number",
    "policy_chapter",
    "document_type",
    "display_status",
    "answer_scope",
    "version_status",
    "effective_label",
    "valid_from",
    "valid_to",
    "requires_qa_signoff",
    "warning_category",
    "current_value",
    "proposed_value",
    "proposed_action",
    "decision_status",
    "reviewer_role",
    "reviewer_name",
    "review_date",
    "owner_escalation_required",
    "production_impact",
    "stop_condition",
    "notes",
]

QUEUE_MAPPINGS = {
    "unresolved_identity_patch_map_candidate.csv": {
        "artifact_type": "unresolved_identity_patch_map",
        "template": "unresolved_identity_patch_map_template.csv",
        "source_queues": ["unresolved_identity_units.csv", "unresolved_identity_chunks.csv"],
        "decision_status": "pending_corpus_admin_review",
        "proposed_action": "review_identity_metadata",
        "production_impact": "blocks_app_integration_or_display_until_resolved",
        "proposed_value": "identity_pending_corpus_admin_review",
        "owner_escalation_required": "true",
        "expected_rows": 38,
    },
    "unknown_effectivity_patch_map_candidate.csv": {
        "artifact_type": "unknown_effectivity_patch_map",
        "template": "unknown_effectivity_patch_map_template.csv",
        "source_queues": ["unknown_effectivity_versions.csv", "unknown_effectivity_chunks.csv"],
        "decision_status": "pending_effectivity_review",
        "proposed_action": "verify_effective_date_or_exclude_from_production",
        "production_impact": "exclude_from_display_until_resolved",
        "proposed_value": "effectivity_pending_verification",
        "owner_escalation_required": "true",
        "expected_rows": 54,
    },
    "qa_signoff_decision_register_candidate.csv": {
        "artifact_type": "qa_signoff_decision_register",
        "template": "qa_signoff_decision_register_template.csv",
        "source_queues": ["qa_signoff_required_versions_summary.csv"],
        "decision_status": "pending_qa_signoff",
        "proposed_action": "corpus_admin_signoff_required",
        "production_impact": "non_displayable_until_signoff",
        "proposed_value": "qa_signoff_pending",
        "owner_escalation_required": "true",
        "expected_rows": 439,
    },
    "dcs_document_anchored_mapping_candidate.csv": {
        "artifact_type": "dcs_document_anchored_mapping",
        "template": "dcs_document_anchored_mapping_template.csv",
        "source_queues": ["dcs_document_anchored_summary.csv"],
        "decision_status": "guardrail_reference_only_pending_mapping",
        "proposed_action": "manual_dcs_mapping_or_keep_guardrail_only",
        "production_impact": "production_answer_authority_prohibited",
        "proposed_value": "keep_guardrail_reference_only_pending_mapping",
        "owner_escalation_required": "false",
        "expected_rows": 1146,
    },
    "restricted_lexis_disposition_register_candidate.csv": {
        "artifact_type": "restricted_lexis_disposition_register",
        "template": "restricted_lexis_disposition_register_template.csv",
        "source_queues": ["restricted_lexis_content_summary.csv"],
        "decision_status": "restricted_internal_qa_only",
        "proposed_action": "license_display_review_required",
        "production_impact": "non_displayable",
        "proposed_value": "internal_qa_only_until_license_and_owner_approval",
        "owner_escalation_required": "true",
        "expected_rows": 2392,
    },
    "pending_extraction_qa_decision_register_candidate.csv": {
        "artifact_type": "pending_extraction_qa_decision_register",
        "template": "pending_extraction_qa_decision_register_template.csv",
        "source_queues": ["pending_extraction_qa_summary.csv"],
        "decision_status": "pending_extraction_qa",
        "proposed_action": "verify_extraction_before_any_display",
        "production_impact": "non_displayable",
        "proposed_value": "keep_non_displayable_pending_extraction_qa",
        "owner_escalation_required": "false",
        "expected_rows": 4198,
    },
    "dcs_handbook_reconciliation_evidence_register_candidate.csv": {
        "artifact_type": "dcs_handbook_reconciliation_evidence_register",
        "template": "dcs_handbook_reconciliation_evidence_register_template.csv",
        "source_queues": ["dcs_handbook_reconciliation_checklist.csv"],
        "decision_status": "evidence_required",
        "proposed_action": "verify_source_status_and_extraction_path",
        "production_impact": "blocks_resolution_of_historical_dcs_source_gap",
        "proposed_value": "evidence_required_before_resolution",
        "owner_escalation_required": "true",
        "expected_rows": 8,
    },
}

DOC_FILES = [
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


def ensure_dirs() -> None:
    for directory in (ARTIFACT_DIR, DASHBOARD_DIR, MANIFEST_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def read_csv_headers(path: Path) -> list[str]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.reader(handle)
        return next(reader)


def write_csv(path: Path, headers: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_doc(filename: str, body: str) -> None:
    (E14B_DIR / filename).write_text(body.strip() + "\n", encoding="utf-8")


def template_headers(template_name: str) -> list[str]:
    path = E14_TEMPLATE_DIR / template_name
    if not path.exists():
        return BASE_ALLOWED_COLUMNS[:]
    headers = read_csv_headers(path)
    merged = ["artifact_type", "source_queue"]
    for header in headers:
        if header not in merged:
            merged.append(header)
    for header in BASE_ALLOWED_COLUMNS:
        if header not in merged:
            merged.append(header)
    return merged


def current_value(row: dict[str, str]) -> str:
    parts = []
    for key in ("display_status", "answer_scope", "version_status"):
        value = (row.get(key) or "").strip()
        if value:
            parts.append(f"{key}={value}")
    return "; ".join(parts) if parts else "metadata_review_required"


def transform_row(row: dict[str, str], source_queue: str, mapping: dict[str, Any]) -> dict[str, str]:
    output = {column: row.get(column, "") for column in BASE_ALLOWED_COLUMNS}
    output.update(
        {
            "artifact_type": mapping["artifact_type"],
            "source_queue": source_queue,
            "current_value": current_value(row),
            "proposed_value": mapping["proposed_value"],
            "proposed_action": mapping["proposed_action"],
            "decision_status": mapping["decision_status"],
            "reviewer_name": "",
            "review_date": "",
            "owner_escalation_required": mapping["owner_escalation_required"],
            "production_impact": mapping["production_impact"],
        }
    )
    if not output.get("reviewer_role"):
        output["reviewer_role"] = "corpus_admin"
    if not output.get("stop_condition"):
        output["stop_condition"] = "No promotion without corpus-admin review and owner-approved future phase"
    notes = output.get("notes") or ""
    phase_note = f"E14-B candidate only from {source_queue}; no corpus change applied"
    output["notes"] = f"{notes}; {phase_note}" if notes else phase_note
    return output


def build_candidate_artifacts() -> tuple[dict[str, Any], dict[str, list[dict[str, str]]]]:
    manifest: dict[str, Any] = {
        "phase": "E14-B",
        "generated_at": TODAY,
        "metadata_only": True,
        "remote_command_run": False,
        "corpus_rows_loaded": False,
        "embeddings_generated": False,
        "app_files_changed": False,
        "migrations_changed": False,
        "active_loader_scripts_changed": False,
        "active_ingestion_scripts_changed": False,
        "source_pdfs_changed": False,
        "generated_corpus_source_files_changed": False,
        "candidate_artifacts": {},
    }
    candidate_rows_by_file: dict[str, list[dict[str, str]]] = {}

    for output_name, mapping in QUEUE_MAPPINGS.items():
        headers = template_headers(mapping["template"])
        rows: list[dict[str, str]] = []
        source_counts = {}
        source_hashes = {}
        for source_queue in mapping["source_queues"]:
            source_path = E13_QUEUE_DIR / source_queue
            source_rows = read_csv(source_path)
            source_counts[source_queue] = len(source_rows)
            source_hashes[source_queue] = sha256_file(source_path)
            rows.extend(transform_row(row, source_queue, mapping) for row in source_rows)

        output_path = ARTIFACT_DIR / output_name
        write_csv(output_path, headers, rows)
        candidate_rows_by_file[output_name] = rows
        manifest["candidate_artifacts"][output_name] = {
            "artifact_type": mapping["artifact_type"],
            "expected_rows": mapping["expected_rows"],
            "observed_rows": len(rows),
            "source_queues": mapping["source_queues"],
            "source_queue_counts": source_counts,
            "source_queue_sha256": source_hashes,
            "sha256": sha256_file(output_path),
            "metadata_only": True,
            "body_text_included": False,
            "default_decision_status": mapping["decision_status"],
            "default_proposed_action": mapping["proposed_action"],
            "default_production_impact": mapping["production_impact"],
        }

    write_json(ARTIFACT_DIR / "metadata_patch_manifest_candidate.json", manifest)
    return manifest, candidate_rows_by_file


def count_by(rows_by_file: dict[str, list[dict[str, str]]], field: str) -> Counter[str]:
    counts: Counter[str] = Counter()
    for rows in rows_by_file.values():
        counts.update((row.get(field) or "blank") for row in rows)
    return counts


def markdown_table(headers: list[str], rows: list[list[Any]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(value) for value in row) + " |")
    return "\n".join(lines)


def load_json_if_exists(path: Path) -> Any | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def static_validation_summary() -> dict[str, Any] | None:
    data = load_json_if_exists(Path("/tmp/benchbook_phase_e14b_static_validation.json"))
    if not isinstance(data, dict):
        return None
    chunks = data.get("chunks") or {}
    return {
        "metadata_only": data.get("metadata_only"),
        "body_text_printed": data.get("body_text_printed"),
        "total_chunks": chunks.get("total_chunks"),
        "display_status_counts": chunks.get("display_status_counts"),
        "production_eligible_chunks": chunks.get("production_eligible_chunks"),
        "candidate_blockers": len(data.get("candidate_blockers") or []),
        "citation_alias_collision_count": chunks.get("citation_alias_collision_count"),
    }


def local_dry_run_summary() -> dict[str, Any] | None:
    data = load_json_if_exists(Path("/tmp/benchbook_phase_e14b_local_target_promotion.json"))
    if not isinstance(data, dict):
        return None
    local = data.get("local_database") or {}
    promotion = local.get("target_promotion") or {}
    verification = promotion.get("verification") or {}
    return {
        "remote_database_connection": data.get("remote_database_connection"),
        "body_text_printed": data.get("body_text_printed"),
        "embeddings_generated": data.get("embeddings_generated"),
        "local_database_executed": local.get("executed"),
        "created_database": local.get("created_database"),
        "dropped_database": (local.get("drop_result") or {}).get("dropped"),
        "draft_migrations_applied": local.get("draft_migrations_applied"),
        "target_promotion_executed": promotion.get("executed"),
        "promoted_authority_chunks": (promotion.get("promoted_counts") or {}).get("authority_chunks"),
        "displayable_view_count": (verification.get("display_gate") or {}).get("displayable_view_count"),
        "restricted_in_displayable_view_count": (verification.get("display_gate") or {}).get("restricted_in_displayable_view_count"),
        "pending_in_displayable_view_count": (verification.get("display_gate") or {}).get("pending_in_displayable_view_count"),
        "dcs_production_eligible_count": (verification.get("dcs_scope") or {}).get("dcs_production_eligible_count"),
        "tre_non_limited_scope_count": (verification.get("tre_scope") or {}).get("tre_non_limited_scope_count"),
        "future_visible_before_2026_07_01_count": (verification.get("effectivity") or {}).get("future_visible_before_2026_07_01_count"),
        "qa_signoff_required_count": (verification.get("effectivity") or {}).get("qa_signoff_required_count"),
        "production_lookup_count": (verification.get("citation_alias") or {}).get("production_lookup_count"),
    }


def write_manifests(manifest: dict[str, Any], rows_by_file: dict[str, list[dict[str, str]]]) -> None:
    artifact_rows = [
        {
            "candidate_artifact": name,
            **data,
        }
        for name, data in manifest["candidate_artifacts"].items()
    ]
    write_json(
        MANIFEST_DIR / "candidate_artifact_manifest.json",
        {
            "phase": "E14-B",
            "generated_at": TODAY,
            "metadata_only": True,
            "candidate_artifacts": artifact_rows,
            "metadata_patch_manifest_sha256": sha256_file(ARTIFACT_DIR / "metadata_patch_manifest_candidate.json"),
        },
    )
    write_json(
        MANIFEST_DIR / "queue_to_candidate_mapping_manifest.json",
        {
            "phase": "E14-B",
            "generated_at": TODAY,
            "mappings": [
                {
                    "candidate_artifact": output_name,
                    "source_queues": mapping["source_queues"],
                    "expected_rows": mapping["expected_rows"],
                    "observed_rows": len(rows_by_file[output_name]),
                    "default_decision_status": mapping["decision_status"],
                    "default_proposed_action": mapping["proposed_action"],
                    "default_production_impact": mapping["production_impact"],
                }
                for output_name, mapping in QUEUE_MAPPINGS.items()
            ],
        },
    )
    validation_path = MANIFEST_DIR / "validation_manifest.json"
    if not validation_path.exists():
        write_json(
            validation_path,
            {
                "phase": "E14-B",
                "generated_at": TODAY,
                "status": "pending_validator_run",
                "metadata_only": True,
                "row_contents_printed": False,
            },
        )
    write_json(
        MANIFEST_DIR / "production_blocker_manifest.json",
        {
            "phase": "E14-B",
            "generated_at": TODAY,
            "blockers": [
                {"blocker": "identity_unresolved", "rows": 38, "status": "candidate_review_pending"},
                {"blocker": "effectivity_unresolved", "rows": 54, "status": "candidate_review_pending"},
                {"blocker": "qa_signoff_pending", "rows": 439, "status": "candidate_review_pending"},
                {"blocker": "dcs_guardrail_only", "rows": 1146, "status": "production_answer_authority_prohibited"},
                {"blocker": "restricted_lexis_non_displayable", "rows": 2392, "status": "license_and_owner_review_required"},
                {"blocker": "pending_extraction_qa", "rows": 4198, "status": "candidate_review_pending"},
                {"blocker": "dcs_handbook_reconciliation", "rows": 8, "status": "evidence_required"},
                {"blocker": "embeddings_not_generated", "rows": 0, "status": "not_authorized"},
                {"blocker": "app_not_integrated", "rows": 0, "status": "not_authorized"},
                {"blocker": "display_gates_closed", "rows": 0, "status": "required"},
            ],
        },
    )


def artifact_summary_rows(manifest: dict[str, Any]) -> list[list[Any]]:
    return [
        [
            name,
            data["observed_rows"],
            data["default_decision_status"],
            data["default_proposed_action"],
            data["default_production_impact"],
        ]
        for name, data in manifest["candidate_artifacts"].items()
    ]


def write_dashboards(manifest: dict[str, Any], rows_by_file: dict[str, list[dict[str, str]]]) -> None:
    artifact_rows = artifact_summary_rows(manifest)
    family_counts = count_by(rows_by_file, "authority_family")
    decision_counts = count_by(rows_by_file, "decision_status")
    display_counts = count_by(rows_by_file, "display_status")

    (DASHBOARD_DIR / "corpus_admin_dashboard.md").write_text(
        f"""# Corpus Admin Dashboard

Date: {TODAY}

## Candidate artifact workload

{markdown_table(["Artifact", "Rows", "Decision status", "Proposed action", "Production impact"], artifact_rows)}

## Authority family workload

{markdown_table(["Authority family", "Rows"], [[key, value] for key, value in sorted(family_counts.items())])}

## Review rule

Every row remains a candidate only. No row becomes displayable, searchable, embedded, or production eligible from this package.
""",
        encoding="utf-8",
    )
    (DASHBOARD_DIR / "owner_decision_dashboard.md").write_text(
        f"""# Owner Decision Dashboard

Date: {TODAY}

## Immediate decisions

{markdown_table(["Decision", "Recommended answer"], [
    ["Next phase", "E14-C local corpus-admin review simulation"],
    ["Preview reload", "Do not execute yet"],
    ["App integration", "Do not approve yet"],
    ["Embeddings", "Do not approve yet"],
    ["Display gate opening", "Do not approve yet"],
])}

## Escalation-heavy queues

{markdown_table(["Queue", "Rows", "Why owner attention may be needed"], [
    ["Unresolved identity", 38, "Authority identity cannot be trusted yet"],
    ["Unknown effectivity", 54, "Current-law status is unresolved"],
    ["QA signoff", 439, "High-risk or effectivity-sensitive versions remain unsigned"],
    ["Restricted Lexis", 2392, "License and display treatment are unresolved"],
])}
""",
        encoding="utf-8",
    )
    (DASHBOARD_DIR / "production_readiness_dashboard.md").write_text(
        f"""# Production Readiness Dashboard

Date: {TODAY}

## Current readiness posture

{markdown_table(["Area", "Status"], [
    ["Display gates", "Closed"],
    ["Embeddings", "Not generated"],
    ["App integration", "Not authorized"],
    ["DCS answer authority", "Prohibited"],
    ["TRE", "Limited-scope"],
    ["Restricted Lexis", "Internal QA only"],
    ["Future and unknown effectivity", "Gated"],
    ["Production corpus replacement", "Not authorized"],
])}

## Candidate display statuses

{markdown_table(["Display status", "Candidate rows"], [[key, value] for key, value in sorted(display_counts.items())])}
""",
        encoding="utf-8",
    )
    (DASHBOARD_DIR / "qa_blocker_burndown_dashboard.md").write_text(
        f"""# QA Blocker Burndown Dashboard

Date: {TODAY}

## Blocker rows

{markdown_table(["Blocker", "Rows", "Default disposition"], [
    ["Unresolved identity", 38, "Pending corpus-admin review"],
    ["Unknown effectivity", 54, "Pending effectivity review"],
    ["QA signoff", 439, "Pending QA signoff"],
    ["DCS mapping", 1146, "Guardrail/reference only pending mapping"],
    ["Restricted Lexis", 2392, "Restricted internal QA only"],
    ["Pending extraction QA", 4198, "Pending extraction QA"],
    ["DCS handbook reconciliation", 8, "Evidence required"],
])}

## Decision status totals

{markdown_table(["Decision status", "Rows"], [[key, value] for key, value in sorted(decision_counts.items())])}
""",
        encoding="utf-8",
    )


def validation_lines() -> str:
    validation = load_json_if_exists(MANIFEST_DIR / "validation_manifest.json")
    if not isinstance(validation, dict):
        return "Validator has not been run yet."
    count_results = validation.get("count_results") or {}
    rows = [[name, result.get("expected"), result.get("observed"), result.get("status")] for name, result in count_results.items()]
    return "\n".join(
        [
            f"Overall status: `{validation.get('status')}`",
            "",
            markdown_table(["Artifact", "Expected", "Observed", "Status"], rows) if rows else "No count results recorded yet.",
        ]
    )


def dry_run_lines() -> str:
    static = static_validation_summary()
    dry = local_dry_run_summary()
    static_text = (
        markdown_table(["Metric", "Value"], [[key, value] for key, value in static.items()])
        if static
        else "Static validation output not present yet."
    )
    dry_text = (
        markdown_table(["Metric", "Value"], [[key, value] for key, value in dry.items()])
        if dry
        else "Local disposable DB dry-run output not present yet."
    )
    return f"""## Static validation

{static_text}

## Local disposable dry run

{dry_text}
"""


def write_docs(manifest: dict[str, Any], rows_by_file: dict[str, list[dict[str, str]]]) -> None:
    artifact_table = markdown_table(
        ["Artifact", "Rows", "Decision status", "Proposed action", "Production impact"],
        artifact_summary_rows(manifest),
    )
    queue_map_table = markdown_table(
        ["Candidate artifact", "Source queues", "Rows"],
        [
            [name, ", ".join(data["source_queues"]), data["observed_rows"]]
            for name, data in manifest["candidate_artifacts"].items()
        ],
    )
    family_table = markdown_table(
        ["Authority family", "Rows"],
        [[key, value] for key, value in sorted(count_by(rows_by_file, "authority_family").items())],
    )

    common_boundary = (
        "E14-B creates candidate metadata artifacts only. It does not apply patches, "
        "reload preview data, generate embeddings, modify the app, modify migrations, "
        "modify source PDFs, modify generated corpus source files, or open display gates."
    )

    docs: dict[str, str] = {
        "00_PHASE_E14B_LOCAL_METADATA_REMEDIATION_ARTIFACT_PACKAGE.md": f"""# Phase E14-B Local Metadata Remediation Artifact Package

Date: {TODAY}
Branch: `refactor/codex-gpt55-launch-prep`

## Executive result

E14-B generated implementation-ready candidate metadata artifacts from the validated E13-A review queues and E14-A templates.

{common_boundary}

## Candidate artifacts

{artifact_table}

## Package posture

- Metadata-only: yes.
- Body text included: no.
- Remote commands run by builder: no.
- Active corpus modified: no.
- App integration performed: no.
- Embeddings generated: no.
""",
        "01_OWNER_APPROVAL_SCOPE.md": f"""# Owner Approval Scope

Date: {TODAY}

## Approved for E14-B

- Read local repository metadata files.
- Read E13-A review queues.
- Read E14-A templates.
- Generate local candidate remediation artifacts under `docs/preview-corpus-e14b/`.
- Generate local dashboards and manifests.
- Run local-only validators and static checks.

## Not approved

- Remote commands.
- Supabase commands.
- Remote database contact.
- Active corpus changes.
- Preview reload execution.
- App code changes.
- Migration changes.
- Existing loader or ingestion script changes.
- Source PDF changes.
- Generated corpus source changes.
- Embedding generation.
- Display gate opening.
""",
        "02_E14A_BASELINE_AND_INPUTS.md": f"""# E14-A Baseline And Inputs

Date: {TODAY}

## Inputs used

{queue_map_table}

## Baseline preserved

- Displayable rows remain zero in the retained preview posture.
- Restricted and pending QA rows remain non-displayable.
- DCS remains guardrail/reference only.
- TRE remains limited-scope.
- Unknown and future effectivity rows remain gated.
- E14-A templates remain metadata-only.
""",
        "03_CANDIDATE_ARTIFACT_GENERATION_METHOD.md": f"""# Candidate Artifact Generation Method

Date: {TODAY}

## Method

1. Read E13-A queue CSV files.
2. Read matching E14-A template headers.
3. Add `artifact_type` and `source_queue`.
4. Preserve metadata fields from the queue.
5. Apply default E14-B candidate decision status, proposed action, proposed value, production impact, and owner escalation flag.
6. Write candidate CSV artifacts under `docs/preview-corpus-e14b/candidate-remediation-artifacts/`.
7. Write manifests and dashboards under the E14-B docs folder.

## Safety design

{common_boundary}

The builder never reads source PDFs, source body files, chunk text files, page text, OCR text, or generated corpus body material.
""",
        "04_UNRESOLVED_IDENTITY_CANDIDATE_PATCHES.md": f"""# Unresolved Identity Candidate Patches

Date: {TODAY}

## Result

`unresolved_identity_patch_map_candidate.csv` contains 38 rows: 17 unresolved unit rows and 21 unresolved chunk rows.

## Default candidate treatment

- Decision status: `pending_corpus_admin_review`
- Proposed action: `review_identity_metadata`
- Production impact: `blocks_app_integration_or_display_until_resolved`

## Boundary

No unresolved identity row is production-displayable from this package. DCS rows remain guardrail/reference only. The TRE row remains limited-scope.
""",
        "05_EFFECTIVITY_CANDIDATE_PATCHES.md": f"""# Effectivity Candidate Patches

Date: {TODAY}

## Result

`unknown_effectivity_patch_map_candidate.csv` contains 54 rows: 15 unknown-effectivity version rows and 39 unknown-effectivity chunk rows.

## Default candidate treatment

- Decision status: `pending_effectivity_review`
- Proposed action: `verify_effective_date_or_exclude_from_production`
- Production impact: `exclude_from_display_until_resolved`

## Boundary

Unknown-effectivity and future-effective material remains gated until a later owner-approved workflow verifies effective-date and as-of-date behavior.
""",
        "06_QA_SIGNOFF_DECISION_REGISTER.md": f"""# QA Signoff Decision Register

Date: {TODAY}

## Result

`qa_signoff_decision_register_candidate.csv` contains 439 rows.

## Default candidate treatment

- Decision status: `pending_qa_signoff`
- Proposed action: `corpus_admin_signoff_required`
- Production impact: `non_displayable_until_signoff`

## Boundary

QA signoff in this register is not production approval. A later approved phase must apply metadata and rerun gates before any display discussion.
""",
        "07_DCS_DOCUMENT_ANCHORED_CANDIDATE_MAPPING.md": f"""# DCS Document-Anchored Candidate Mapping

Date: {TODAY}

## Result

`dcs_document_anchored_mapping_candidate.csv` contains 1,146 rows.

## Default candidate treatment

- Decision status: `guardrail_reference_only_pending_mapping`
- Proposed action: `manual_dcs_mapping_or_keep_guardrail_only`
- Production impact: `production_answer_authority_prohibited`

## Boundary

DCS remains guardrail/reference only and production-answer authority is prohibited unless a later owner-approved workflow changes that after mapping and source currency review.
""",
        "08_RESTRICTED_LEXIS_CANDIDATE_DISPOSITION.md": f"""# Restricted Lexis Candidate Disposition

Date: {TODAY}

## Result

`restricted_lexis_disposition_register_candidate.csv` contains 2,392 rows.

## Default candidate treatment

- Decision status: `restricted_internal_qa_only`
- Proposed action: `license_display_review_required`
- Production impact: `non_displayable`

## Boundary

Restricted Lexis material remains internal QA only. It is not source-card material, answer authority, production display material, or independent case-law verification material.
""",
        "09_PENDING_EXTRACTION_QA_CANDIDATE_DISPOSITION.md": f"""# Pending Extraction QA Candidate Disposition

Date: {TODAY}

## Result

`pending_extraction_qa_decision_register_candidate.csv` contains 4,198 rows.

## Default candidate treatment

- Decision status: `pending_extraction_qa`
- Proposed action: `verify_extraction_before_any_display`
- Production impact: `non_displayable`

## Boundary

Pending extraction QA rows remain non-displayable. Body text review, if needed, requires a separate approved workflow and must not be copied into committed artifacts.
""",
        "10_DCS_HANDBOOK_EVIDENCE_REGISTER.md": f"""# DCS Handbook Evidence Register

Date: {TODAY}

## Result

`dcs_handbook_reconciliation_evidence_register_candidate.csv` contains 8 rows.

## Default candidate treatment

- Decision status: `evidence_required`
- Proposed action: `verify_source_status_and_extraction_path`
- Production impact: `blocks_resolution_of_historical_dcs_source_gap`

## Boundary

The DCS handbook issue remains a provenance blocker until evidence is reviewed. It does not authorize DCS answer authority or display.
""",
        "11_ARTIFACT_VALIDATION_RESULTS.md": f"""# Artifact Validation Results

Date: {TODAY}

{validation_lines()}
""",
        "12_LOCAL_DRY_RUN_AND_GATE_BASELINE.md": f"""# Local Dry Run And Gate Baseline

Date: {TODAY}

{dry_run_lines()}
""",
        "13_CORPUS_ADMIN_REVIEW_DASHBOARD.md": f"""# Corpus Admin Review Dashboard

Date: {TODAY}

## Artifact workload

{artifact_table}

## Authority family totals

{family_table}

Use `dashboards/corpus_admin_dashboard.md` for the operational dashboard.
""",
        "14_OWNER_DECISION_PACKET.md": f"""# Owner Decision Packet

Date: {TODAY}

## Recommended decision

Approve E14-C local corpus-admin review simulation using the candidate artifacts. Do not approve preview reload execution, app integration, embeddings, production display, or display-gate opening yet.

## Why

The package moved from templates to populated candidate artifacts, but all rows still need corpus-admin or owner review before any future patch application.

## Current blockers

{markdown_table(["Blocker", "Rows"], [
    ["Unresolved identity", 38],
    ["Unknown effectivity", 54],
    ["QA signoff", 439],
    ["DCS mapping", 1146],
    ["Restricted Lexis", 2392],
    ["Pending extraction QA", 4198],
    ["DCS handbook reconciliation", 8],
])}
""",
        "15_E15_PREVIEW_RELOAD_PLANNING_INPUTS.md": f"""# E15 Preview Reload Planning Inputs

Date: {TODAY}

## Inputs prepared

- Candidate artifact manifest.
- Queue-to-candidate mapping manifest.
- Production blocker manifest.
- Candidate patch maps and decision registers.
- Local validation command list.
- Local dry-run baseline when present.

## E15 boundary

E15 should be planning only unless separately approved. It must not execute a reload, generate embeddings, connect the app, modify display gates, or contact production.
""",
        "16_PRODUCTION_READINESS_DELTA.md": f"""# Production Readiness Delta

Date: {TODAY}

## Remaining delta

{markdown_table(["Gap", "Current status"], [
    ["Identity unresolved", "38 candidate rows"],
    ["Effectivity unresolved", "54 candidate rows"],
    ["QA signoff pending", "439 candidate rows"],
    ["DCS guardrail only", "DCS production-answer authority prohibited"],
    ["Restricted Lexis", "2,392 rows non-displayable"],
    ["Pending extraction QA", "4,198 rows non-displayable"],
    ["DCS handbook reconciliation", "8 evidence rows pending"],
    ["Embeddings", "Not generated"],
    ["App integration", "Not performed"],
    ["Display gates", "Closed"],
    ["Production corpus replacement", "Not performed"],
    ["Migration-history caveat", "Still unresolved from prior phases"],
    ["Retrieval/citation app path", "Database-backed path absent"],
    ["Judicial guardrails in database-backed app path", "Not integrated"],
])}
""",
        "17_NEXT_PHASE_PROMPT.md": """# Next Phase Prompt

Use one of these prompts only after separate owner approval.

## Recommended E14-C

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

Owner approval is granted for Phase E14-C only: corpus administrator review simulation using E14-B candidate artifacts.

Authorized actions are local-only. Read the E14-B candidate artifacts, simulate corpus-admin review workflows, classify rows into review buckets, and produce review-ready summary packets. Do not apply changes to active corpus data. Do not run remote commands. Do not run Supabase commands. Do not modify app code, migrations, existing loader scripts, existing ingestion scripts, source PDFs, or generated corpus source files. Do not generate embeddings. Do not open display gates.

## Alternative E15-A

Owner approval is granted for Phase E15-A only: preview reload planning after owner or corpus-admin review.

Authorized actions are local planning only. Do not execute a reload. Do not connect the app. Do not generate embeddings. Do not open display gates. Do not contact production.
""",
        "18_NEXT_SESSION_START_HERE.md": """# Next Session Start Here

## Current posture

E14-B created local candidate metadata remediation artifacts. They are not applied to any corpus, app, database, migration, source PDF, generated corpus source file, or embedding workflow.

## Start commands

```bash
pwd
git branch --show-current
git status --short
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py
find docs/preview-corpus-e14 docs/preview-corpus-e14b scripts/metadata_qa -type f | sort
```

## Recommended next decision

Approve E14-C local corpus-admin review simulation. Do not approve preview reload execution yet.
""",
    }
    for filename in DOC_FILES:
        write_doc(filename, docs[filename])


def main() -> None:
    ensure_dirs()
    manifest, rows_by_file = build_candidate_artifacts()
    write_manifests(manifest, rows_by_file)
    write_dashboards(manifest, rows_by_file)
    write_docs(manifest, rows_by_file)
    print("E14-B candidate artifact build: PASS")
    print(f"candidate_artifacts: {len(QUEUE_MAPPINGS)}")
    print(f"docs_written: {len(DOC_FILES)}")
    print("remote_database_connection: false")
    print("body_text_printed: false")


if __name__ == "__main__":
    main()
