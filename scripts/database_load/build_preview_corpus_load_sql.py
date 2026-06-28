#!/usr/bin/env python3
"""Build Phase E10 preview corpus-load SQL artifacts.

This generator does not contact Supabase and does not execute SQL. It reuses the
Phase E4 local loader's validated mapping logic, then writes local, uncommitted
SQL artifacts for the approved E10-B preview load path.

The generated SQL contains corpus text and must stay outside the repository.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import uuid
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
LOCAL_LOADER_PATH = ROOT / "scripts/database_load/dry_run_load_legal_authority.py"

APPROVED_TARGET_NAME = "benchbook-ai"
APPROVED_TARGET_REF = "clerihqbjyczarqkiqnb"
FORBIDDEN_TARGET_NAME = "benchbook-ai-prod"
FORBIDDEN_TARGET_REF = "suiylfayvjsjtbrsjrwx"

FAMILY_CODES = {
    "tca_title_36": "tca_title_36",
    "tca_title_37": "tca_title_37",
    "tenn_rules_juvenile_practice_procedure": "tenn_rules_juvenile_practice_procedure",
    "tenn_rules_evidence": "tenn_rules_evidence",
    "dcs_policies_procedures": "dcs_policies_procedures",
}

EXPECTED_STAGE_COUNTS = {
    "raw_source_manifest": 677,
    "raw_expanded_chunks": 6590,
    "raw_extraction_warnings": 864,
    "raw_deduplication_groups": 12,
}

EXPECTED_PROMOTED_COUNTS = {
    "source_files": 647,
    "source_file_memberships": 677,
    "authority_units": 1321,
    "authority_versions": 1343,
    "authority_chunks": 6590,
    "citation_aliases": 3598,
    "chunk_warnings": 359,
    "extraction_warnings": 864,
    "retrieval_logs": 1,
    "answer_audit_records": 1,
    "citation_verification_records": 1,
}


def load_local_loader() -> Any:
    sys.path.insert(0, str(LOCAL_LOADER_PATH.parent))
    spec = importlib.util.spec_from_file_location("benchbook_local_loader", LOCAL_LOADER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {LOCAL_LOADER_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sql_literal(loader: Any, value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        return repr(value)
    return loader.sql_literal(str(value))


def values_sql(loader: Any, rows: list[list[Any]]) -> str:
    return ",\n".join(
        "  (" + ", ".join(sql_literal(loader, value) for value in row) + ")" for row in rows
    )


def insert_values(
    loader: Any,
    table: str,
    columns: list[str],
    rows: list[list[Any]],
    batch_size: int,
) -> list[str]:
    if not rows:
        return []
    statements: list[str] = []
    for start in range(0, len(rows), batch_size):
        batch = rows[start : start + batch_size]
        statements.append(
            f"insert into {table} ({', '.join(columns)}) values\n{values_sql(loader, batch)};\n"
        )
    return statements


SOURCE_FILE_CASTS = {
    "source_file_id": "v.source_file_id::uuid",
    "source_manifest_sha256": "v.source_manifest_sha256",
    "sha256": "v.sha256",
    "primary_source_path": "v.primary_source_path",
    "filename": "v.filename",
    "extension": "v.extension",
    "size_bytes": "v.size_bytes::bigint",
    "source_type": "v.source_type::legal_authority.source_type",
    "authority_family_id": "f.authority_family_id",
    "authority_range_label": "v.authority_range_label",
    "approval_status": "v.approval_status::legal_authority.approval_status",
    "corpus_designation": "v.corpus_designation",
    "storage_status": "v.storage_status",
    "metadata": "v.metadata::jsonb",
}

AUTHORITY_UNIT_CASTS = {
    "authority_unit_id": "v.authority_unit_id::uuid",
    "authority_family_id": "f.authority_family_id",
    "source_type": "v.source_type::legal_authority.source_type",
    "canonical_citation": "v.canonical_citation",
    "normalized_citation": "v.normalized_citation",
    "title": "v.title",
    "chapter": "v.chapter",
    "part": "v.part",
    "section": "v.section",
    "subsection": "v.subsection",
    "rule_number": "v.rule_number",
    "policy_number": "v.policy_number",
    "policy_chapter": "v.policy_chapter",
    "document_type": "v.document_type",
    "hierarchy_path": "v.hierarchy_path::text[]",
    "corpus_designation": "v.corpus_designation",
    "answer_scope": "v.answer_scope::legal_authority.answer_scope",
    "sort_key": "v.sort_key",
    "metadata": "v.metadata::jsonb",
}


def insert_family_join(
    loader: Any,
    section: dict[str, Any],
    casts: dict[str, str],
    join_type: str,
    batch_size: int,
) -> list[str]:
    columns = section["columns"]
    rows = section["rows"]
    family_idx = columns.index("authority_family_id")
    value_columns = columns[:family_idx] + ["authority_family_code"] + columns[family_idx + 1 :]
    aliases = ", ".join(value_columns)
    select_parts = [casts[column] for column in columns]
    statements: list[str] = []
    for start in range(0, len(rows), batch_size):
        batch = [row[:family_idx] + [row[family_idx]] + row[family_idx + 1 :] for row in rows[start : start + batch_size]]
        statements.append(
            f"insert into {section['table']} ({', '.join(columns)})\n"
            f"select {', '.join(select_parts)}\n"
            f"from (values\n{values_sql(loader, batch)}\n) as v({aliases})\n"
            f"{join_type} legal_authority.authority_families f on f.family_code = v.authority_family_code;\n"
        )
    return statements


def statements_for_section(loader: Any, section: dict[str, Any]) -> list[str]:
    table = section["table"]
    if table == "legal_authority.source_files":
        # Some source manifest rows are source-file metadata without a V1 family.
        # The target column is nullable, so this join must be left-joined.
        return insert_family_join(loader, section, SOURCE_FILE_CASTS, "left join", batch_size=200)
    if table == "legal_authority.authority_units":
        return insert_family_join(loader, section, AUTHORITY_UNIT_CASTS, "join", batch_size=200)
    if table in {"legal_authority.authority_chunks", "legal_authority_stage.raw_expanded_chunks"}:
        return insert_values(loader, table, section["columns"], section["rows"], batch_size=5)
    return insert_values(loader, table, section["columns"], section["rows"], batch_size=250)


def preflight_sql() -> str:
    return """
do $$
declare v_count integer; v_policies integer; v_rls integer;
begin
  select count(*) into v_count from information_schema.schemata where schema_name in ('legal_authority', 'legal_authority_stage');
  if v_count <> 2 then raise exception 'E10 preflight failed: schema count %', v_count; end if;
  select count(*) into v_count from information_schema.tables where table_schema in ('legal_authority', 'legal_authority_stage') and table_type = 'BASE TABLE';
  if v_count <> 20 then raise exception 'E10 preflight failed: base table count %', v_count; end if;
  select count(*) into v_count from information_schema.views where table_schema = 'legal_authority';
  if v_count <> 3 then raise exception 'E10 preflight failed: view count %', v_count; end if;
  select count(*) into v_count from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'legal_authority';
  if v_count <> 3 then raise exception 'E10 preflight failed: function count %', v_count; end if;
  select count(*) into v_rls from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('legal_authority','legal_authority_stage') and c.relkind = 'r' and c.relrowsecurity;
  if v_rls <> 20 then raise exception 'E10 preflight failed: RLS table count %', v_rls; end if;
  select count(*) into v_policies from pg_policies where schemaname = 'legal_authority' and tablename = 'authority_chunks';
  if v_policies <> 0 then raise exception 'E10 preflight failed: authority_chunks policy count %', v_policies; end if;
  select count(*) into v_count from legal_authority.source_files;
  v_count := v_count + (select count(*) from legal_authority.source_file_memberships) + (select count(*) from legal_authority.authority_units) + (select count(*) from legal_authority.authority_versions) + (select count(*) from legal_authority.authority_chunks) + (select count(*) from legal_authority.citation_aliases) + (select count(*) from legal_authority.chunk_warnings) + (select count(*) from legal_authority.extraction_warnings) + (select count(*) from legal_authority.retrieval_logs) + (select count(*) from legal_authority.answer_audit_records) + (select count(*) from legal_authority.citation_verification_records) + (select count(*) from legal_authority_stage.raw_source_manifest) + (select count(*) from legal_authority_stage.raw_expanded_chunks) + (select count(*) from legal_authority_stage.raw_extraction_warnings) + (select count(*) from legal_authority_stage.raw_deduplication_groups);
  if v_count <> 0 then raise exception 'E10 preflight failed: corpus, audit, or stage rows already exist %', v_count; end if;
  select count(*) into v_count from legal_authority.v_current_displayable_chunks;
  if v_count <> 0 then raise exception 'E10 preflight failed: displayable view count %', v_count; end if;
end $$;
"""


def postflight_sql(loader: Any, alias_probe: str) -> str:
    return f"""
do $$
declare v_count integer; v_embedding_count integer;
begin
  select count(*) into v_count from legal_authority_stage.raw_source_manifest; if v_count <> 677 then raise exception 'E10 postflight failed: raw_source_manifest %', v_count; end if;
  select count(*) into v_count from legal_authority_stage.raw_expanded_chunks; if v_count <> 6590 then raise exception 'E10 postflight failed: raw_expanded_chunks %', v_count; end if;
  select count(*) into v_count from legal_authority_stage.raw_extraction_warnings; if v_count <> 864 then raise exception 'E10 postflight failed: raw_extraction_warnings %', v_count; end if;
  select count(*) into v_count from legal_authority_stage.raw_deduplication_groups; if v_count <> 12 then raise exception 'E10 postflight failed: raw_deduplication_groups %', v_count; end if;
  select count(*) into v_count from legal_authority.source_files; if v_count <> 647 then raise exception 'E10 postflight failed: source_files %', v_count; end if;
  select count(*) into v_count from legal_authority.source_file_memberships; if v_count <> 677 then raise exception 'E10 postflight failed: source_file_memberships %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_units; if v_count <> 1321 then raise exception 'E10 postflight failed: authority_units %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_versions; if v_count <> 1343 then raise exception 'E10 postflight failed: authority_versions %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_chunks; if v_count <> 6590 then raise exception 'E10 postflight failed: authority_chunks %', v_count; end if;
  select count(*) into v_count from legal_authority.citation_aliases; if v_count <> 3598 then raise exception 'E10 postflight failed: citation_aliases %', v_count; end if;
  select count(*) into v_count from legal_authority.chunk_warnings; if v_count <> 359 then raise exception 'E10 postflight failed: chunk_warnings %', v_count; end if;
  select count(*) into v_count from legal_authority.extraction_warnings; if v_count <> 864 then raise exception 'E10 postflight failed: extraction_warnings %', v_count; end if;
  select count(*) into v_count from legal_authority.retrieval_logs; if v_count <> 1 then raise exception 'E10 postflight failed: retrieval_logs %', v_count; end if;
  select count(*) into v_count from legal_authority.answer_audit_records; if v_count <> 1 then raise exception 'E10 postflight failed: answer_audit_records %', v_count; end if;
  select count(*) into v_count from legal_authority.citation_verification_records; if v_count <> 1 then raise exception 'E10 postflight failed: citation_verification_records %', v_count; end if;
  select count(*) into v_count from legal_authority.v_current_displayable_chunks; if v_count <> 0 then raise exception 'E10 postflight failed: displayable view %', v_count; end if;
  select count(*) into v_count from legal_authority.v_black_letter_current_chunks; if v_count <> 0 then raise exception 'E10 postflight failed: black-letter view %', v_count; end if;
  select count(*) into v_count from legal_authority.v_internal_qa_restricted_chunks; if v_count <> 6590 then raise exception 'E10 postflight failed: internal QA restricted view %', v_count; end if;
  select count(*) into v_count from legal_authority.v_current_displayable_chunks where production_display_status in ('pending_extraction_qa', 'restricted_pending_license_review') or approval_status <> 'approved_for_production'; if v_count <> 0 then raise exception 'E10 postflight failed: pending or restricted rows displayable %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_chunks c join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id where f.family_code = 'dcs_policies_procedures'; if v_count <> 2014 then raise exception 'E10 postflight failed: DCS chunk count %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_chunks c join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id where f.family_code = 'dcs_policies_procedures' and c.answer_scope = 'guardrail_reference_only'; if v_count <> 2014 then raise exception 'E10 postflight failed: DCS guardrail count %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_chunks c join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id where f.family_code = 'dcs_policies_procedures' and c.approval_status = 'approved_for_production' and c.production_display_status = 'displayable_policy_text'; if v_count <> 0 then raise exception 'E10 postflight failed: DCS production eligible %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_chunks c join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id where f.family_code = 'tenn_rules_evidence' and c.answer_scope = 'limited_evidentiary_procedural'; if v_count <> 533 then raise exception 'E10 postflight failed: TRE limited scope %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_chunks c join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id where f.family_code = 'tenn_rules_evidence' and c.answer_scope <> 'limited_evidentiary_procedural'; if v_count <> 0 then raise exception 'E10 postflight failed: TRE non-limited scope %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_versions where version_status = 'future_effective'; if v_count <> 16 then raise exception 'E10 postflight failed: future version count %', v_count; end if;
  select count(*) into v_count from legal_authority.authority_versions where version_status = 'unknown_effectivity'; if v_count <> 15 then raise exception 'E10 postflight failed: unknown-effectivity version count %', v_count; end if;
  select count(*) into v_count from legal_authority.v_current_displayable_chunks c join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id where v.version_status in ('future_effective', 'unknown_effectivity'); if v_count <> 0 then raise exception 'E10 postflight failed: future or unknown-effectivity displayable %', v_count; end if;
  select count(*) into v_count from (select source_chunk_id from legal_authority.authority_chunks group by source_chunk_id having count(*) > 1) d; if v_count <> 0 then raise exception 'E10 postflight failed: duplicate source_chunk_id groups %', v_count; end if;
  select count(*) into v_count from (select normalized_alias from legal_authority.citation_aliases group by normalized_alias having count(distinct authority_unit_id) > 1) d; if v_count <> 0 then raise exception 'E10 postflight failed: alias collision groups %', v_count; end if;
  select count(*) into v_count from legal_authority.lookup_citation_alias({sql_literal(loader, alias_probe)}, date '2026-06-16'); if v_count <> 0 then raise exception 'E10 postflight failed: production citation lookup count %', v_count; end if;
  select count(*) into v_count from legal_authority.search_displayable_chunks('dependency neglect', date '2026-06-16', null, 20); if v_count <> 0 then raise exception 'E10 postflight failed: search displayable count %', v_count; end if;
  if exists (select 1 from information_schema.columns where table_schema = 'legal_authority' and table_name = 'authority_chunks' and column_name = 'embedding') then execute 'select count(*) from legal_authority.authority_chunks where embedding is not null' into v_embedding_count; if v_embedding_count <> 0 then raise exception 'E10 postflight failed: populated embeddings %', v_embedding_count; end if; end if;
end $$;
"""


def wrap_transaction(statements: list[str]) -> str:
    return "\n".join(["begin;", "set local statement_timeout = '20min';", *statements, "commit;", ""])


def write_batch_files(output_dir: Path, data_statements: list[str], max_bytes: int) -> list[dict[str, Any]]:
    batch_dir = output_dir / "batches"
    batch_dir.mkdir(parents=True, exist_ok=True)
    for old_file in batch_dir.glob("*.sql"):
        old_file.unlink()

    files: list[dict[str, Any]] = []
    current: list[str] = []
    current_bytes = len(wrap_transaction([]).encode("utf-8"))
    index = 1
    for statement in data_statements:
        statement_bytes = len(statement.encode("utf-8"))
        if current and current_bytes + statement_bytes > max_bytes:
            path = batch_dir / f"{index:03d}_load_batch.sql"
            path.write_text(wrap_transaction(current), encoding="utf-8")
            files.append({"path": str(path), "bytes": path.stat().st_size})
            index += 1
            current = []
            current_bytes = len(wrap_transaction([]).encode("utf-8"))
        current.append(statement)
        current_bytes += statement_bytes
    if current:
        path = batch_dir / f"{index:03d}_load_batch.sql"
        path.write_text(wrap_transaction(current), encoding="utf-8")
        files.append({"path": str(path), "bytes": path.stat().st_size})
    return files


def build_artifacts(output_dir: Path, max_batch_bytes: int) -> dict[str, Any]:
    loader = load_local_loader()
    validation_report = loader.build_report()
    load_batch_id = str(uuid.uuid4())
    corpus_build_id = str(uuid.uuid4())
    captured: list[dict[str, Any]] = []

    def fake_fetch_key_values(database_url: str, sql: str) -> dict[str, str]:
        return dict(FAMILY_CODES)

    def fake_copy_columns(database_url: str, table: str, columns: list[str], rows: list[list[Any]]) -> int:
        captured.append({"table": table, "columns": columns, "rows": rows})
        return len(rows)

    def fake_run_target_verification(database_url: str, alias_probe: str, retrieval_log_id: str) -> dict[str, Any]:
        return {"skipped": "sql_generation_only", "alias_probe": alias_probe, "retrieval_log_id": retrieval_log_id}

    loader.fetch_key_values = fake_fetch_key_values
    loader.copy_columns = fake_copy_columns
    loader.run_target_verification = fake_run_target_verification

    stage_sections = [
        {
            "table": "legal_authority_stage.raw_source_manifest",
            "columns": ["load_batch_id", "source_line_number", "raw_json", "validation_status"],
            "rows": loader.jsonl_rows(loader.MANIFEST, load_batch_id),
        },
        {
            "table": "legal_authority_stage.raw_expanded_chunks",
            "columns": ["load_batch_id", "source_line_number", "raw_json", "validation_status"],
            "rows": loader.jsonl_rows(loader.CHUNKS, load_batch_id),
        },
        {
            "table": "legal_authority_stage.raw_extraction_warnings",
            "columns": ["load_batch_id", "source_line_number", "raw_json", "validation_status"],
            "rows": loader.warning_rows(loader.WARNINGS, load_batch_id),
        },
        {
            "table": "legal_authority_stage.raw_deduplication_groups",
            "columns": ["load_batch_id", "source_line_number", "raw_json", "validation_status"],
            "rows": loader.dedupe_rows(loader.DEDUPE, load_batch_id),
        },
    ]

    promotion = loader.promote_targets("sql-generation-only", validation_report, load_batch_id, corpus_build_id)
    build_version = "phase-e10-preview-" + load_batch_id
    chunk_summary = json.dumps(validation_report["summary"], separators=(",", ":"))

    output_dir.mkdir(parents=True, exist_ok=True)
    preflight_path = output_dir / "000_preflight_and_build.sql"
    preflight_path.write_text(
        wrap_transaction(
            [
                preflight_sql(),
                "insert into legal_authority.corpus_builds (corpus_build_id, build_version, build_label, manifest_sha256, chunk_jsonl_sha256, extraction_pipeline_version, source_selection, chunk_summary, approval_status, validation_status, built_at, loaded_at, notes) values\n"
                + values_sql(
                    loader,
                    [
                        [
                            corpus_build_id,
                            build_version,
                            "Phase E10-B preview corpus-load dry run, retained gated batch",
                            validation_report["manifest"]["file_sha256"],
                            validation_report["chunks"]["file_sha256"],
                            validation_report["summary"]["pipeline_version"] or "unknown",
                            "{}",
                            chunk_summary,
                            "pending_extraction_qa",
                            "passed_with_warnings",
                            "2026-06-28 00:00:00+00",
                            "2026-06-28 00:00:00+00",
                            f"Preview dry run only. Load batch {load_batch_id}. Display gates must remain closed. No embeddings. No app integration.",
                        ]
                    ],
                )
                + ";",
            ]
        ),
        encoding="utf-8",
    )

    data_statements: list[str] = []
    for section in stage_sections:
        data_statements.extend(statements_for_section(loader, section))
    for section in captured:
        data_statements.extend(statements_for_section(loader, section))

    batch_files = write_batch_files(output_dir, data_statements, max_batch_bytes)

    postflight_path = output_dir / "999_postflight.sql"
    postflight_path.write_text(
        wrap_transaction([postflight_sql(loader, promotion["audit"]["audit_alias_normalized"])]),
        encoding="utf-8",
    )

    rollback_path = output_dir / "rollback_retained_batch.sql"
    rollback_path.write_text(
        f"""-- BenchBook.AI Phase E10-B retained-batch cleanup plan. Generated artifact. Do not commit.
-- Intended target only: {APPROVED_TARGET_NAME} / {APPROVED_TARGET_REF}.
-- Run only after separate owner approval if cleanup is desired.
begin;
delete from legal_authority.citation_verification_records where answer_audit_record_id in (select answer_audit_record_id from legal_authority.answer_audit_records where corpus_build_id = '{corpus_build_id}');
delete from legal_authority.answer_audit_records where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.refusal_records where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.retrieval_logs where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.chunk_warnings where authority_chunk_id in (select authority_chunk_id from legal_authority.authority_chunks where corpus_build_id = '{corpus_build_id}');
delete from legal_authority.citation_aliases where authority_unit_id in (select authority_unit_id from legal_authority.authority_units where metadata->>'phase' = 'E4');
delete from legal_authority.extraction_warnings where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.authority_chunks where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.authority_versions where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.source_file_memberships where corpus_build_id = '{corpus_build_id}';
delete from legal_authority.authority_units where metadata->>'phase' = 'E4';
delete from legal_authority.source_files where metadata->>'phase' = 'E4';
delete from legal_authority.corpus_builds where corpus_build_id = '{corpus_build_id}';
delete from legal_authority_stage.raw_source_manifest where load_batch_id = '{load_batch_id}';
delete from legal_authority_stage.raw_expanded_chunks where load_batch_id = '{load_batch_id}';
delete from legal_authority_stage.raw_extraction_warnings where load_batch_id = '{load_batch_id}';
delete from legal_authority_stage.raw_deduplication_groups where load_batch_id = '{load_batch_id}';
commit;
""",
        encoding="utf-8",
    )

    manifest = {
        "phase": "E10-B",
        "target_name": APPROVED_TARGET_NAME,
        "target_ref": APPROVED_TARGET_REF,
        "forbidden_target_name": FORBIDDEN_TARGET_NAME,
        "forbidden_target_ref": FORBIDDEN_TARGET_REF,
        "load_batch_id": load_batch_id,
        "corpus_build_id": corpus_build_id,
        "build_version": build_version,
        "body_text_in_tmp_sql": True,
        "body_text_printed": False,
        "embeddings_generated": False,
        "app_integration": False,
        "preflight_path": str(preflight_path),
        "postflight_path": str(postflight_path),
        "rollback_path": str(rollback_path),
        "batch_files": batch_files,
        "max_batch_bytes": max_batch_bytes,
        "stage_counts": {section["table"].split(".")[-1]: len(section["rows"]) for section in stage_sections},
        "promoted_counts": promotion["promoted_counts"],
        "identity_results": promotion["identity_results"],
        "reconciliation": promotion["reconciliation"],
        "effectivity_status_counts_from_chunks": promotion["effectivity_status_counts_from_chunks"],
        "audit": promotion["audit"],
        "static_validation": {
            "metadata_only": validation_report["metadata_only"],
            "body_text_printed": validation_report["body_text_printed"],
            "manifest_rows": validation_report["manifest"]["rows"],
            "unique_sha256_count": validation_report["manifest"]["unique_sha256_count"],
            "total_chunks": validation_report["chunks"]["total_chunks"],
            "duplicate_chunk_id_count": validation_report["chunks"]["duplicate_chunk_id_count"],
            "citation_alias_collision_count": validation_report["chunks"]["citation_alias_collision_count"],
        },
    }

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    manifest["manifest_path"] = str(manifest_path)
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        default="/tmp/benchbook_e10_preview_load",
        help="Directory for generated SQL artifacts. Must not be inside the repository.",
    )
    parser.add_argument("--max-batch-bytes", type=int, default=4_500_000)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    if ROOT in output_dir.parents or output_dir == ROOT:
        raise SystemExit("Refusing to write source-text SQL artifacts inside the repository.")
    manifest = build_artifacts(output_dir, args.max_batch_bytes)
    print(
        json.dumps(
            {
                "manifest_path": manifest["manifest_path"],
                "preflight_path": manifest["preflight_path"],
                "postflight_path": manifest["postflight_path"],
                "rollback_path": manifest["rollback_path"],
                "batch_file_count": len(manifest["batch_files"]),
                "largest_batch_bytes": max(file["bytes"] for file in manifest["batch_files"]),
                "body_text_printed": False,
                "embeddings_generated": False,
                "stage_counts": manifest["stage_counts"],
                "promoted_counts": manifest["promoted_counts"],
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
