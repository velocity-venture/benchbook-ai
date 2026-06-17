#!/usr/bin/env python3
"""Local-only Phase E4 dry-run loader for the legal_authority schema.

The loader always runs static validation first. With a local database target, it
applies draft migrations, stages raw JSON into legal_authority_stage, and
promotes the derivative corpus into target tables for local verification. It
does not connect to remote databases, generate embeddings, or print legal text.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import uuid
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from validate_expanded_chunks_for_load import (
    CHUNKS,
    DEDUPE,
    MANIFEST,
    MIGRATIONS_DRAFT,
    ROOT,
    WARNINGS,
    build_report,
    read_json,
)


UUID_NAMESPACE = uuid.UUID("2beac7c1-b1f6-5cc3-a886-6a2ea61f3c33")

RESTRICTED_CHUNK_TYPES = {"annotation_candidate", "case_note_candidate", "advisory_comment"}
BLACK_LETTER_FAMILIES = {
    "tca_title_36",
    "tca_title_37",
    "tenn_rules_juvenile_practice_procedure",
}
HIGH_RISK_TERMS = {
    "termination",
    "parental",
    "guardianship",
    "adoption",
    "custody",
    "dependent",
    "neglect",
    "removal",
    "surrender",
    "juvenile court",
    "procedure",
}
MONTHS = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}


def is_local_database_target(target: str) -> bool:
    if "://" not in target:
        return True
    parsed = urlparse(target)
    if parsed.scheme not in {"postgres", "postgresql"}:
        return False
    host = parsed.hostname
    return host in {None, "", "localhost", "127.0.0.1", "::1"}


def run_command(command: list[str], input_text: str | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        input=input_text,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def require_psql() -> str:
    psql = shutil.which("psql")
    if not psql:
        raise RuntimeError("psql is not available; local database dry run cannot execute.")
    return psql


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def psql(database_url: str, sql: str) -> subprocess.CompletedProcess[str]:
    return run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-c", sql])


def apply_migrations(database_url: str) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for path in sorted(MIGRATIONS_DRAFT.glob("*.sql")):
        proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-f", str(path)])
        results.append(
            {
                "migration": str(path.relative_to(ROOT)),
                "returncode": proc.returncode,
                "stdout_tail": proc.stdout.strip().splitlines()[-5:],
                "stderr_tail": proc.stderr.strip().splitlines()[-5:],
            }
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Migration failed: {path}\n{proc.stderr}")
    return results


def csv_rows(rows: list[list[Any]]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerows(rows)
    return buffer.getvalue()


def copy_rows(database_url: str, table: str, rows: list[list[Any]]) -> int:
    if not rows:
        return 0
    sql = (
        f"copy {table} (load_batch_id, source_line_number, raw_json, validation_status) "
        "from stdin with (format csv)"
    )
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-c", sql], csv_rows(rows))
    if proc.returncode != 0:
        raise RuntimeError(f"COPY failed for {table}\n{proc.stderr}")
    return len(rows)


def copy_columns(database_url: str, table: str, columns: list[str], rows: list[list[Any]]) -> int:
    if not rows:
        return 0
    cols = ", ".join(columns)
    sql = f"copy {table} ({cols}) from stdin with (format csv)"
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-c", sql], csv_rows(rows))
    if proc.returncode != 0:
        raise RuntimeError(f"COPY failed for {table}\n{proc.stderr}")
    return len(rows)


def jsonl_rows(path: Path, load_batch_id: str) -> list[list[Any]]:
    rows: list[list[Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            obj = json.loads(line)
            rows.append([load_batch_id, line_number, json.dumps(obj, separators=(",", ":")), "pending"])
    return rows


def iter_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            yield line_number, json.loads(line)


def stable_uuid(kind: str, value: str) -> str:
    return str(uuid.uuid5(UUID_NAMESPACE, f"{kind}:{value}"))


def normalize(value: str) -> str:
    return "".join(ch.lower() for ch in value if ch.isalnum())


def is_missing(value: Any) -> bool:
    return value is None or value == "" or value == [] or value == {}


def pg_array(values: list[str]) -> str:
    if not values:
        return "{}"
    escaped = []
    for value in values:
        item = str(value).replace("\\", "\\\\").replace('"', '\\"')
        escaped.append(f'"{item}"')
    return "{" + ",".join(escaped) + "}"


def warning_code(value: Any) -> str:
    if isinstance(value, str):
        return value.split(":", 1)[0]
    if isinstance(value, dict):
        return str(value.get("code") or "unknown")
    return "unknown"


def warning_detail(value: Any) -> str:
    if isinstance(value, str):
        return value.split(":", 1)[1] if ":" in value else ""
    if isinstance(value, dict):
        return str(value.get("detail") or "")
    return ""


def parse_dcs_chapter(source_path: str) -> str | None:
    match = re.search(r"TN_DCS_Policies/([^/]+)/", source_path)
    return match.group(1) if match else None


def parse_document_type(source_path: str, fallback: str | None = None) -> str | None:
    if fallback:
        return fallback
    filename = Path(source_path).name
    match = re.match(r"^\d+_([^_]+)_", filename)
    return match.group(1).lower() if match else None


def parse_date_label(text: str, phrase: str) -> str | None:
    pattern = rf"{phrase}\s+([A-Za-z]+)\s+(\d{{1,2}}),\s+(\d{{4}})"
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None
    month = MONTHS.get(match.group(1).lower())
    if not month:
        return None
    return f"{int(match.group(3)):04d}-{month:02d}-{int(match.group(2)):02d}"


def effective_label(row: dict[str, Any]) -> str:
    title = row.get("title") or ""
    bracket = re.search(r"\[(Effective[^\]]+)\]", title, flags=re.IGNORECASE)
    if bracket:
        label = bracket.group(1)
        if re.match(r"Effective\s+(?:on\s+|until\s+|[A-Za-z]+\s+\d{1,2},\s+\d{4}|when\b)", label, flags=re.IGNORECASE):
            return label
    for warning in row.get("extraction_warnings") or []:
        if not warning_code(warning).startswith("effective_dated"):
            continue
        detail = warning_detail(warning)
        bracket = re.search(r"\[(Effective[^\]]+)\]", detail, flags=re.IGNORECASE)
        if bracket:
            label = bracket.group(1)
            if re.match(r"Effective\s+(?:on\s+|until\s+|[A-Za-z]+\s+\d{1,2},\s+\d{4}|when\b)", label, flags=re.IGNORECASE):
                return label
        match = re.search(
            r"\bEffective\s+(?:on\s+|until\s+)?(?:[A-Za-z]+\s+\d{1,2},\s+\d{4}|when\b.{0,160})",
            detail,
            flags=re.IGNORECASE,
        )
        if match:
            return match.group(0)
    return ""


def version_status_for_row(row: dict[str, Any]) -> dict[str, Any]:
    label = effective_label(row)
    warnings = {warning_code(w) for w in row.get("extraction_warnings") or []}
    has_effective_warning = any(code.startswith("effective_dated") for code in warnings) or bool(label)
    lower = label.lower()
    valid_from = "1900-01-01"
    valid_to = None
    status = "current"
    if lower.startswith("effective until"):
        status = "current"
        valid_to = parse_date_label(label, "effective until")
    elif lower.startswith("effective on") or re.match(r"effective\s+[a-z]+\s+\d{1,2},\s+\d{4}", lower):
        status = "future_effective"
        parsed_from = parse_date_label(label, "effective on") or parse_date_label(label, "effective")
        if parsed_from:
            valid_from = parsed_from
        else:
            status = "unknown_effectivity"
            valid_from = None
    elif has_effective_warning:
        status = "unknown_effectivity"
        valid_from = None
    return {
        "effective_label": label,
        "valid_from": valid_from,
        "valid_to": valid_to,
        "version_status": status,
        "has_effective_date_warning": has_effective_warning,
        "requires_effectivity_qa": has_effective_warning,
        "qa_signoff_required": has_effective_warning,
    }


def answer_scope_for(row: dict[str, Any]) -> str:
    family = row.get("authority_family")
    chunk_type = row.get("chunk_type")
    if family == "tenn_rules_evidence":
        return "limited_evidentiary_procedural"
    if chunk_type in RESTRICTED_CHUNK_TYPES:
        return "not_answer_authority"
    if family == "dcs_policies_procedures":
        return "guardrail_reference_only"
    if chunk_type in {"history", "metadata", "unknown"}:
        return "guardrail_reference_only"
    return "general_answer_authority"


def retrieval_gate_for(row: dict[str, Any]) -> str:
    display = row.get("production_display_status")
    chunk_type = row.get("chunk_type")
    if display == "restricted_pending_license_review" or chunk_type in RESTRICTED_CHUNK_TYPES:
        return "restricted_pending_license_review"
    if display == "internal_qa_only":
        return "internal_qa_only"
    return "deny_until_approved"


def chunk_identity(row: dict[str, Any]) -> dict[str, Any]:
    family = str(row.get("authority_family") or "")
    canonical = row.get("canonical_citation") or None
    section = row.get("section") or None
    rule_number = row.get("rule_number") or None
    policy_number = row.get("policy_number") or None
    policy_chapter = row.get("policy_chapter") or None
    document_type = row.get("document_type") or None
    source_path = row.get("source_path") or ""
    chunk_type = row.get("chunk_type") or "unknown"

    if family == "dcs_policies_procedures":
        if canonical:
            normalized = normalize(canonical)
            key = f"{family}:citation:{normalized}"
            return {
                "key": key,
                "normalized": normalized,
                "unresolved": False,
                "identity_status": "resolved",
                "alias_eligible": True,
            }
        if policy_number:
            normalized = normalize(f"{policy_chapter or ''}:{policy_number}")
            key = f"{family}:policy:{normalized}"
            return {
                "key": key,
                "normalized": normalized,
                "unresolved": False,
                "identity_status": "resolved",
                "alias_eligible": True,
            }
        if source_path and document_type and document_type != "unknown":
            normalized = normalize(f"{row.get('source_manifest_sha256') or source_path}:{document_type}")
            key = f"{family}:document:{normalized}"
            return {
                "key": key,
                "normalized": normalized,
                "unresolved": False,
                "identity_status": "document_anchored",
                "alias_eligible": False,
            }
        unresolved_key = normalize(f"{family}:{source_path}:{document_type or ''}:{chunk_type}") or normalize(
            str(row.get("chunk_id"))
        )
        return {
            "key": f"{family}:unresolved:{unresolved_key}",
            "normalized": None,
            "unresolved": True,
            "identity_status": "unresolved",
            "alias_eligible": False,
        }

    if canonical:
        normalized = normalize(canonical)
        key = f"{family}:citation:{normalized}"
        return {"key": key, "normalized": normalized, "unresolved": False, "identity_status": "resolved", "alias_eligible": True}
    if section:
        normalized = normalize(section)
        key = f"{family}:section:{normalized}"
        return {"key": key, "normalized": normalized, "unresolved": False, "identity_status": "resolved", "alias_eligible": True}
    if rule_number:
        normalized = normalize(rule_number)
        key = f"{family}:rule:{normalized}"
        return {"key": key, "normalized": normalized, "unresolved": False, "identity_status": "resolved", "alias_eligible": True}
    if policy_number:
        normalized = normalize(f"{policy_chapter or ''}:{policy_number}")
        key = f"{family}:policy:{normalized}"
        return {"key": key, "normalized": normalized, "unresolved": False, "identity_status": "resolved", "alias_eligible": True}

    unresolved_key = normalize(f"{family}:{source_path}:{document_type or ''}:{chunk_type}") or normalize(str(row.get("chunk_id")))
    return {
        "key": f"{family}:unresolved:{unresolved_key}",
        "normalized": None,
        "unresolved": True,
        "identity_status": "unresolved",
        "alias_eligible": False,
    }


def load_manifest_rows() -> tuple[dict[str, dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    by_sha: dict[str, dict[str, Any]] = {}
    rows_by_sha: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for _, row in iter_jsonl(MANIFEST):
        sha = row.get("sha256")
        if not sha:
            continue
        rows_by_sha[sha].append(row)
        by_sha.setdefault(sha, row)
    return by_sha, rows_by_sha


def load_chunk_rows() -> list[dict[str, Any]]:
    return [row for _, row in iter_jsonl(CHUNKS)]


def table_counts_sql() -> str:
    return """
      select 'answer_audit_records', count(*) from legal_authority.answer_audit_records
      union all select 'authority_chunks', count(*) from legal_authority.authority_chunks
      union all select 'authority_families', count(*) from legal_authority.authority_families
      union all select 'authority_units', count(*) from legal_authority.authority_units
      union all select 'authority_versions', count(*) from legal_authority.authority_versions
      union all select 'chunk_warnings', count(*) from legal_authority.chunk_warnings
      union all select 'citation_aliases', count(*) from legal_authority.citation_aliases
      union all select 'corpus_builds', count(*) from legal_authority.corpus_builds
      union all select 'extraction_warnings', count(*) from legal_authority.extraction_warnings
      union all select 'refusal_records', count(*) from legal_authority.refusal_records
      union all select 'retrieval_logs', count(*) from legal_authority.retrieval_logs
      union all select 'source_file_memberships', count(*) from legal_authority.source_file_memberships
      union all select 'source_files', count(*) from legal_authority.source_files
      union all select 'raw_deduplication_groups', count(*) from legal_authority_stage.raw_deduplication_groups
      union all select 'raw_expanded_chunks', count(*) from legal_authority_stage.raw_expanded_chunks
      union all select 'raw_extraction_warnings', count(*) from legal_authority_stage.raw_extraction_warnings
      union all select 'raw_source_manifest', count(*) from legal_authority_stage.raw_source_manifest
      order by 1;
    """


def warning_rows(path: Path, load_batch_id: str) -> list[list[Any]]:
    data = read_json(path)
    rows: list[list[Any]] = []
    for index, item in enumerate(data.get("warnings") or [], start=1):
        rows.append([load_batch_id, index, json.dumps(item, separators=(",", ":")), "pending"])
    return rows


def dedupe_rows(path: Path, load_batch_id: str) -> list[list[Any]]:
    data = read_json(path)
    rows: list[list[Any]] = []
    for index, item in enumerate(data.get("duplicate_groups") or [], start=1):
        rows.append([load_batch_id, index, json.dumps(item, separators=(",", ":")), "pending"])
    return rows


def insert_corpus_build(database_url: str, validation_report: dict[str, Any], load_batch_id: str) -> str:
    manifest_sha = validation_report["manifest"]["file_sha256"]
    chunk_sha = validation_report["chunks"]["file_sha256"]
    pipeline = validation_report["summary"]["pipeline_version"] or "unknown"
    chunk_summary = json.dumps(validation_report["summary"], separators=(",", ":"))
    build_version = "phase-e4-local-" + load_batch_id
    sql = f"""
      insert into legal_authority.corpus_builds (
        build_version,
        build_label,
        manifest_sha256,
        chunk_jsonl_sha256,
        extraction_pipeline_version,
        source_selection,
        chunk_summary,
        approval_status,
        validation_status,
        built_at,
        loaded_at,
        notes
      ) values (
        {sql_literal(build_version)},
        'Phase E4 local disposable target promotion dry run',
        {sql_literal(manifest_sha)},
        {sql_literal(chunk_sha)},
        {sql_literal(pipeline)},
        '{{}}'::jsonb,
        {sql_literal(chunk_summary)}::jsonb,
        'pending_extraction_qa',
        'passed_with_warnings',
        now(),
        now(),
        'Local disposable dry-run staging and target promotion only. Not production.'
      )
      on conflict (build_version) do update set loaded_at = excluded.loaded_at
      returning corpus_build_id;
    """
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-At", "-c", sql])
    if proc.returncode != 0:
        raise RuntimeError(f"corpus_builds insert failed\n{proc.stderr}")
    corpus_build_id = ""
    for line in proc.stdout.strip().splitlines():
        candidate = line.strip()
        if re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", candidate):
            corpus_build_id = candidate
            break
    if not corpus_build_id:
        raise RuntimeError("corpus_builds insert did not return an id.")
    return corpus_build_id


def stage_inputs(database_url: str, load_batch_id: str) -> dict[str, int]:
    counts = {
        "raw_source_manifest": copy_rows(
            database_url,
            "legal_authority_stage.raw_source_manifest",
            jsonl_rows(MANIFEST, load_batch_id),
        ),
        "raw_expanded_chunks": copy_rows(
            database_url,
            "legal_authority_stage.raw_expanded_chunks",
            jsonl_rows(CHUNKS, load_batch_id),
        ),
        "raw_extraction_warnings": copy_rows(
            database_url,
            "legal_authority_stage.raw_extraction_warnings",
            warning_rows(WARNINGS, load_batch_id),
        ),
        "raw_deduplication_groups": copy_rows(
            database_url,
            "legal_authority_stage.raw_deduplication_groups",
            dedupe_rows(DEDUPE, load_batch_id),
        ),
    }
    return counts


def fetch_key_values(database_url: str, sql: str) -> dict[str, str]:
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-At", "-F", "\t", "-c", sql])
    if proc.returncode != 0:
        raise RuntimeError(f"key/value query failed\n{proc.stderr}")
    values: dict[str, str] = {}
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        key, value = line.split("\t", 1)
        values[key] = value
    return values


def fetch_json(database_url: str, sql: str) -> Any:
    wrapped = f"select coalesce(jsonb_agg(row_to_json(q)), '[]'::jsonb) from ({sql}) q;"
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-At", "-c", wrapped])
    if proc.returncode != 0:
        raise RuntimeError(f"JSON query failed\n{proc.stderr}")
    return json.loads(proc.stdout.strip() or "[]")


def fetch_int(database_url: str, sql: str) -> int:
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-At", "-c", sql])
    if proc.returncode != 0:
        raise RuntimeError(f"integer query failed\n{proc.stderr}")
    return int((proc.stdout.strip() or "0").splitlines()[-1])


def mapped_approval_status(value: Any) -> str:
    valid = {
        "pending_extraction_qa",
        "approved_for_internal_qa",
        "approved_for_production",
        "rejected",
        "not_required_metadata",
    }
    text = str(value or "")
    return text if text in valid else "pending_extraction_qa"


def json_metadata(value: dict[str, Any]) -> str:
    return json.dumps(value, separators=(",", ":"), sort_keys=True)


def source_type_for_family(family_code: str, fallback: str | None = None) -> str:
    if fallback in {"statute", "rule", "dcs_policy", "metadata", "unknown"}:
        return fallback
    if family_code in {"tca_title_36", "tca_title_37"}:
        return "statute"
    if family_code in {"tenn_rules_evidence", "tenn_rules_juvenile_practice_procedure"}:
        return "rule"
    if family_code == "dcs_policies_procedures":
        return "dcs_policy"
    return "unknown"


def production_eligible(row: dict[str, Any]) -> bool:
    return (
        row.get("approval_status") == "approved_for_production"
        and row.get("production_display_status") in {"displayable_black_letter", "displayable_policy_text"}
    )


def text_hash_rollup(hashes: list[str]) -> str | None:
    clean = sorted(h for h in hashes if isinstance(h, str) and len(h) == 64)
    if not clean:
        return None
    return hashlib.sha256("\n".join(clean).encode("utf-8")).hexdigest()


def unit_field_values(row: dict[str, Any], identity: dict[str, Any]) -> dict[str, Any]:
    family = str(row.get("authority_family") or "")
    identity_status = identity.get("identity_status")
    if identity_status in {"unresolved", "document_anchored"}:
        return {
            "canonical_citation": None,
            "normalized_citation": None,
            "section": None,
            "subsection": None,
            "rule_number": None,
            "policy_number": None,
            "policy_chapter": row.get("policy_chapter") or parse_dcs_chapter(str(row.get("source_path") or "")),
        }
    if family == "dcs_policies_procedures":
        canonical = row.get("canonical_citation") or None
        return {
            "canonical_citation": canonical,
            "normalized_citation": normalize(canonical or row.get("policy_number") or ""),
            "section": None,
            "subsection": None,
            "rule_number": None,
            "policy_number": row.get("policy_number") or None,
            "policy_chapter": row.get("policy_chapter") or parse_dcs_chapter(str(row.get("source_path") or "")),
        }
    canonical = row.get("canonical_citation") or None
    return {
        "canonical_citation": canonical,
        "normalized_citation": identity.get("normalized"),
        "section": row.get("section") or None,
        "subsection": row.get("subsection") or None,
        "rule_number": row.get("rule_number") or None,
        "policy_number": None,
        "policy_chapter": None,
    }


def row_source_hash(row: dict[str, Any]) -> str:
    return str(row.get("source_manifest_sha256") or "")


def promote_targets(
    database_url: str,
    validation_report: dict[str, Any],
    load_batch_id: str,
    corpus_build_id: str,
) -> dict[str, Any]:
    manifest_by_sha, manifest_rows_by_sha = load_manifest_rows()
    chunks = load_chunk_rows()
    dedupe = read_json(DEDUPE)
    warnings = read_json(WARNINGS)
    family_ids = fetch_key_values(
        database_url,
        "select family_code, authority_family_id::text from legal_authority.authority_families order by family_code",
    )

    manifest_path_to_sha: dict[str, str] = {}
    for sha, rows in manifest_rows_by_sha.items():
        for row in rows:
            source_path = str(row.get("relative_path") or "")
            if source_path:
                manifest_path_to_sha[source_path] = sha

    chunk_source_paths = {str(row.get("source_path") or "") for row in chunks if row.get("source_path")}
    dedupe_primary_by_sha: dict[str, str] = {}
    dedupe_alias_paths: set[str] = set()
    dedupe_primary_paths: set[str] = set()
    for group in dedupe.get("duplicate_groups") or []:
        sha = str(group.get("sha256") or "")
        primary_path = str(group.get("primary_path") or "")
        if sha and primary_path:
            dedupe_primary_by_sha[sha] = primary_path
            dedupe_primary_paths.add(primary_path)
        for alias_path in group.get("alias_paths") or []:
            if alias_path:
                dedupe_alias_paths.add(str(alias_path))

    source_file_rows: list[list[Any]] = []
    source_file_ids: dict[str, str] = {}
    for sha, manifest_row in sorted(manifest_by_sha.items()):
        source_file_id = stable_uuid("source_file", sha)
        source_file_ids[sha] = source_file_id
        family_code = str(manifest_row.get("authority_family") or "")
        primary_path = dedupe_primary_by_sha.get(sha) or str(manifest_row.get("relative_path") or "")
        source_paths = sorted(
            str(row.get("relative_path") or "")
            for row in manifest_rows_by_sha.get(sha, [])
            if row.get("relative_path")
        )
        metadata = {
            "phase": "E4",
            "manifest_version": manifest_row.get("manifest_version"),
            "generated_at": manifest_row.get("generated_at"),
            "source_root": manifest_row.get("source_root"),
            "source_paths": source_paths,
            "original_approval_status": manifest_row.get("approval_status"),
        }
        source_file_rows.append(
            [
                source_file_id,
                sha,
                sha,
                primary_path,
                manifest_row.get("filename") or Path(primary_path).name,
                manifest_row.get("extension"),
                manifest_row.get("size_bytes"),
                source_type_for_family(family_code, manifest_row.get("source_type")),
                family_ids.get(family_code),
                manifest_row.get("authority_range_label"),
                mapped_approval_status(manifest_row.get("approval_status")),
                manifest_row.get("corpus_designation"),
                manifest_row.get("storage_status"),
                json_metadata(metadata),
            ]
        )

    copy_columns(
        database_url,
        "legal_authority.source_files",
        [
            "source_file_id",
            "source_manifest_sha256",
            "sha256",
            "primary_source_path",
            "filename",
            "extension",
            "size_bytes",
            "source_type",
            "authority_family_id",
            "authority_range_label",
            "approval_status",
            "corpus_designation",
            "storage_status",
            "metadata",
        ],
        source_file_rows,
    )

    source_path_rows: dict[str, dict[str, Any]] = {}
    for sha, rows in manifest_rows_by_sha.items():
        for row in rows:
            source_path = str(row.get("relative_path") or "")
            if not source_path:
                continue
            source_path_rows[source_path] = {"sha": sha, "manifest_row": row}
    for group in dedupe.get("duplicate_groups") or []:
        sha = str(group.get("sha256") or "")
        for source_path in [group.get("primary_path"), *(group.get("alias_paths") or [])]:
            if source_path and source_path not in source_path_rows:
                source_path_rows[str(source_path)] = {"sha": sha, "manifest_row": manifest_by_sha.get(sha, {})}

    membership_rows: list[list[Any]] = []
    for source_path, data in sorted(source_path_rows.items()):
        sha = data["sha"]
        source_file_id = source_file_ids.get(sha)
        if not source_file_id:
            continue
        manifest_row = data.get("manifest_row") or {}
        if source_path in dedupe_alias_paths:
            path_role = "alias"
        elif source_path == dedupe_primary_by_sha.get(sha):
            path_role = "primary"
        else:
            path_role = "manifest_path"
        metadata = {
            "phase": "E4",
            "dedupe_role": path_role,
            "source_manifest_sha256": sha,
            "selected_as_chunk_source": source_path in chunk_source_paths,
        }
        membership_rows.append(
            [
                stable_uuid("source_membership", f"{sha}:{source_path}"),
                source_file_id,
                source_path,
                path_role,
                parse_dcs_chapter(source_path),
                parse_document_type(source_path, manifest_row.get("document_type")),
                corpus_build_id,
                source_path in chunk_source_paths or source_path in dedupe_primary_paths,
                json_metadata(metadata),
            ]
        )
    copy_columns(
        database_url,
        "legal_authority.source_file_memberships",
        [
            "source_file_membership_id",
            "source_file_id",
            "source_path",
            "path_role",
            "dcs_chapter",
            "document_type",
            "corpus_build_id",
            "is_selected_for_build",
            "metadata",
        ],
        membership_rows,
    )

    unit_rows_by_key: dict[str, dict[str, Any]] = {}
    version_rows_by_key: dict[str, dict[str, Any]] = {}
    chunk_payloads: list[dict[str, Any]] = []
    alias_candidates: dict[tuple[str, str], dict[str, Any]] = {}
    unresolved_chunk_count = 0
    missing_source_chunk_count = 0
    effectivity_status_counts: Counter[str] = Counter()
    high_risk_version_keys: set[str] = set()
    source_chunk_id_totals = Counter(str(row.get("chunk_id") or "") for row in chunks)
    source_chunk_id_seen: Counter[str] = Counter()
    identity_status_chunk_counts: Counter[str] = Counter()
    unresolved_by_family: Counter[str] = Counter()
    unresolved_by_chunk_type: Counter[str] = Counter()

    for row in chunks:
        identity = chunk_identity(row)
        family_code = str(row.get("authority_family") or "")
        identity_status = str(identity.get("identity_status", "resolved"))
        identity_status_chunk_counts[identity_status] += 1
        if identity["unresolved"]:
            unresolved_by_family[family_code] += 1
            unresolved_by_chunk_type[str(row.get("chunk_type") or "unknown")] += 1
        source_hash = row_source_hash(row)
        source_file_id = source_file_ids.get(source_hash)
        if not source_file_id:
            missing_source_chunk_count += 1
            continue
        if identity["unresolved"]:
            unresolved_chunk_count += 1
        unit_key = identity["key"]
        unit_id = stable_uuid("authority_unit", unit_key)
        fields = unit_field_values(row, identity)
        unit_meta = {
            "phase": "E4",
            "identity_status": identity.get("identity_status", "resolved"),
            "identity_key": unit_key,
            "first_source_path": row.get("source_path"),
        }
        unit_rows_by_key.setdefault(
            unit_key,
            {
                "authority_unit_id": unit_id,
                "authority_family_id": family_ids[family_code],
                "source_type": source_type_for_family(family_code, row.get("source_type")),
                "canonical_citation": fields["canonical_citation"],
                "normalized_citation": fields["normalized_citation"],
                "title": row.get("title") or None,
                "chapter": row.get("chapter") or None,
                "part": row.get("part") or None,
                "section": fields["section"],
                "subsection": fields["subsection"],
                "rule_number": fields["rule_number"],
                "policy_number": fields["policy_number"],
                "policy_chapter": fields["policy_chapter"],
                "document_type": row.get("document_type") or parse_document_type(str(row.get("source_path") or "")),
                "hierarchy_path": row.get("hierarchy_path") or [],
                "corpus_designation": row.get("corpus_designation") or "unknown",
                "answer_scope": answer_scope_for(row),
                "sort_key": fields["canonical_citation"]
                or fields["rule_number"]
                or fields["policy_number"]
                or fields["section"]
                or unit_key,
                "metadata": unit_meta,
                "identity_unresolved": identity["unresolved"],
                "identity_status": identity.get("identity_status", "resolved"),
            },
        )

        version_info = version_status_for_row(row)
        version_key = f"{unit_id}:{source_file_id}:{version_info['version_status']}:{version_info['effective_label']}"
        version_id = stable_uuid("authority_version", version_key)
        effectivity_status_counts[version_info["version_status"]] += 1
        high_risk_text = " ".join(
            str(row.get(key) or "")
            for key in ["title", "canonical_citation", "section", "rule_number", "policy_number", "authority_family"]
        ).lower()
        high_risk = any(term in high_risk_text for term in HIGH_RISK_TERMS)
        if high_risk:
            high_risk_version_keys.add(version_key)
        version_entry = version_rows_by_key.setdefault(
            version_key,
            {
                "authority_version_id": version_id,
                "authority_unit_id": unit_id,
                "source_file_id": source_file_id,
                "corpus_build_id": corpus_build_id,
                "source_version_label": Path(str(row.get("source_path") or "")).name,
                "authority_version_label": row.get("canonical_citation")
                or row.get("rule_number")
                or row.get("policy_number")
                or row.get("title")
                or "unresolved authority",
                "effective_label": version_info["effective_label"] or None,
                "valid_from": version_info["valid_from"],
                "valid_to": version_info["valid_to"],
                "version_status": version_info["version_status"],
                "has_effective_date_warning": version_info["has_effective_date_warning"],
                "requires_effectivity_qa": version_info["requires_effectivity_qa"],
                "qa_signoff_required": version_info["qa_signoff_required"] or high_risk,
                "text_hashes": [],
                "metadata": {
                    "phase": "E4",
                    "source_path": row.get("source_path"),
                    "source_hash": source_hash,
                    "requires_high_risk_review": high_risk,
                },
            },
        )
        version_entry["text_hashes"].append(row.get("text_sha256"))
        if version_info["requires_effectivity_qa"]:
            version_entry["requires_effectivity_qa"] = True
            version_entry["qa_signoff_required"] = True

        original_source_chunk_id = str(row.get("chunk_id") or "")
        source_chunk_id_seen[original_source_chunk_id] += 1
        source_chunk_id = (
            f"{original_source_chunk_id}#occurrence-{source_chunk_id_seen[original_source_chunk_id]}"
            if source_chunk_id_totals[original_source_chunk_id] > 1
            else original_source_chunk_id
        )
        chunk_id = stable_uuid("authority_chunk", source_chunk_id)
        chunk_payloads.append(
            {
                "authority_chunk_id": chunk_id,
                "source_chunk_id": source_chunk_id,
                "original_source_chunk_id": original_source_chunk_id,
                "authority_version_id": version_id,
                "authority_unit_id": unit_id,
                "source_file_id": source_file_id,
                "corpus_build_id": corpus_build_id,
                "chunk_type": row.get("chunk_type") or "unknown",
                "text": row.get("text") or "",
                "text_sha256": row.get("text_sha256"),
                "page_start": row.get("page_start"),
                "page_end": row.get("page_end"),
                "production_display_status": row.get("production_display_status") or "pending_extraction_qa",
                "retrieval_display_gate": retrieval_gate_for(row),
                "approval_status": mapped_approval_status(row.get("approval_status")),
                "validation_status": "passed_with_warnings" if row.get("extraction_warnings") else "passed",
                "answer_scope": answer_scope_for(row),
                "black_letter_eligible": family_code in BLACK_LETTER_FAMILIES
                and row.get("chunk_type") == "black_letter_text",
                "metadata": {
                    "phase": "E4",
                    "source_path": row.get("source_path"),
                    "source_hash": source_hash,
                    "authority_family": family_code,
                    "corpus_designation": row.get("corpus_designation"),
                    "answer_scope_note": row.get("answer_scope_note"),
                    "warning_codes": [warning_code(w) for w in row.get("extraction_warnings") or []],
                    "identity_status": identity.get("identity_status", "resolved"),
                    "production_eligible_at_load": production_eligible(row),
                    "original_source_chunk_id": original_source_chunk_id,
                    "source_chunk_id_occurrence": source_chunk_id_seen[original_source_chunk_id],
                    "source_chunk_id_was_duplicate": source_chunk_id_totals[original_source_chunk_id] > 1,
                },
                "warnings": row.get("extraction_warnings") or [],
            }
        )

        if identity.get("alias_eligible"):
            alias_values: list[tuple[str, str]] = []
            if row.get("canonical_citation"):
                alias_values.append((str(row["canonical_citation"]), "canonical"))
            for alias in row.get("citation_aliases") or []:
                if alias:
                    alias_values.append((str(alias), "source_alias"))
            if family_code in {"tca_title_36", "tca_title_37"} and row.get("section"):
                alias_values.append((str(row["section"]), "section"))
            if family_code == "dcs_policies_procedures" and row.get("policy_number"):
                alias_values.append((str(row["policy_number"]), "policy_number"))
            for alias_text, alias_kind in alias_values:
                normalized = normalize(alias_text)
                if not normalized:
                    continue
                alias_candidates.setdefault(
                    (unit_id, normalized),
                    {
                        "authority_unit_id": unit_id,
                        "alias_text": alias_text,
                        "normalized_alias": normalized,
                        "alias_kind": alias_kind,
                    },
                )

    unit_rows = []
    for unit in sorted(unit_rows_by_key.values(), key=lambda item: item["authority_unit_id"]):
        unit_rows.append(
            [
                unit["authority_unit_id"],
                unit["authority_family_id"],
                unit["source_type"],
                unit["canonical_citation"],
                unit["normalized_citation"],
                unit["title"],
                unit["chapter"],
                unit["part"],
                unit["section"],
                unit["subsection"],
                unit["rule_number"],
                unit["policy_number"],
                unit["policy_chapter"],
                unit["document_type"],
                pg_array([str(item) for item in unit["hierarchy_path"]]),
                unit["corpus_designation"],
                unit["answer_scope"],
                unit["sort_key"],
                json_metadata(unit["metadata"]),
            ]
        )
    copy_columns(
        database_url,
        "legal_authority.authority_units",
        [
            "authority_unit_id",
            "authority_family_id",
            "source_type",
            "canonical_citation",
            "normalized_citation",
            "title",
            "chapter",
            "part",
            "section",
            "subsection",
            "rule_number",
            "policy_number",
            "policy_chapter",
            "document_type",
            "hierarchy_path",
            "corpus_designation",
            "answer_scope",
            "sort_key",
            "metadata",
        ],
        unit_rows,
    )

    version_rows = []
    for version in sorted(version_rows_by_key.values(), key=lambda item: item["authority_version_id"]):
        version_hash = text_hash_rollup(version.pop("text_hashes"))
        metadata = dict(version["metadata"])
        metadata["chunk_count"] = sum(
            1 for chunk in chunk_payloads if chunk["authority_version_id"] == version["authority_version_id"]
        )
        version_rows.append(
            [
                version["authority_version_id"],
                version["authority_unit_id"],
                version["source_file_id"],
                version["corpus_build_id"],
                version["source_version_label"],
                version["authority_version_label"],
                version["effective_label"],
                version["valid_from"],
                version["valid_to"],
                version["version_status"],
                version["has_effective_date_warning"],
                version["requires_effectivity_qa"],
                version["qa_signoff_required"],
                version_hash,
                json_metadata(metadata),
            ]
        )
    copy_columns(
        database_url,
        "legal_authority.authority_versions",
        [
            "authority_version_id",
            "authority_unit_id",
            "source_file_id",
            "corpus_build_id",
            "source_version_label",
            "authority_version_label",
            "effective_label",
            "valid_from",
            "valid_to",
            "version_status",
            "has_effective_date_warning",
            "requires_effectivity_qa",
            "qa_signoff_required",
            "version_text_hash",
            "metadata",
        ],
        version_rows,
    )

    chunk_rows = []
    chunk_warning_rows = []
    for payload in chunk_payloads:
        chunk_rows.append(
            [
                payload["authority_chunk_id"],
                payload["source_chunk_id"],
                payload["authority_version_id"],
                payload["authority_unit_id"],
                payload["source_file_id"],
                payload["corpus_build_id"],
                payload["chunk_type"],
                payload["text"],
                payload["text_sha256"],
                payload["page_start"],
                payload["page_end"],
                payload["production_display_status"],
                payload["retrieval_display_gate"],
                payload["approval_status"],
                payload["validation_status"],
                payload["answer_scope"],
                payload["black_letter_eligible"],
                json_metadata(payload["metadata"]),
            ]
        )
        for index, warning in enumerate(payload["warnings"], start=1):
            code = warning_code(warning)
            detail = warning_detail(warning)
            chunk_warning_rows.append(
                [
                    stable_uuid("chunk_warning", f"{payload['authority_chunk_id']}:{index}:{code}"),
                    payload["authority_chunk_id"],
                    code,
                    detail,
                    "warning",
                    json_metadata({"phase": "E4", "source_chunk_id": payload["source_chunk_id"]}),
                ]
            )
    copy_columns(
        database_url,
        "legal_authority.authority_chunks",
        [
            "authority_chunk_id",
            "source_chunk_id",
            "authority_version_id",
            "authority_unit_id",
            "source_file_id",
            "corpus_build_id",
            "chunk_type",
            "text",
            "text_sha256",
            "page_start",
            "page_end",
            "production_display_status",
            "retrieval_display_gate",
            "approval_status",
            "validation_status",
            "answer_scope",
            "black_letter_eligible",
            "metadata",
        ],
        chunk_rows,
    )

    collision_map: dict[str, set[str]] = defaultdict(set)
    for (_, normalized), alias in alias_candidates.items():
        collision_map[normalized].add(alias["authority_unit_id"])
    collision_norms = {normalized for normalized, unit_ids in collision_map.items() if len(unit_ids) > 1}
    alias_rows = []
    for (unit_id, normalized), alias in sorted(alias_candidates.items()):
        if normalized in collision_norms:
            continue
        alias_rows.append(
            [
                stable_uuid("citation_alias", f"{unit_id}:{normalized}"),
                unit_id,
                None,
                None,
                alias["alias_text"],
                normalized,
                alias["alias_kind"],
                json_metadata({"phase": "E4"}),
            ]
        )
    copy_columns(
        database_url,
        "legal_authority.citation_aliases",
        [
            "citation_alias_id",
            "authority_unit_id",
            "authority_version_id",
            "authority_chunk_id",
            "alias_text",
            "normalized_alias",
            "alias_kind",
            "metadata",
        ],
        alias_rows,
    )

    copy_columns(
        database_url,
        "legal_authority.chunk_warnings",
        [
            "chunk_warning_id",
            "authority_chunk_id",
            "warning_code",
            "warning_detail",
            "severity",
            "metadata",
        ],
        chunk_warning_rows,
    )

    extraction_warning_rows = []
    for index, warning in enumerate(warnings.get("warnings") or [], start=1):
        source_path = str(warning.get("source_path") or "")
        source_hash = manifest_path_to_sha.get(source_path)
        source_file_id = source_file_ids.get(source_hash or "")
        code = str(warning.get("code") or "unknown")
        extraction_warning_rows.append(
            [
                stable_uuid("extraction_warning", f"{load_batch_id}:{index}:{source_path}:{code}"),
                corpus_build_id,
                source_file_id,
                code,
                warning.get("detail"),
                "warning",
                warning.get("page"),
                json_metadata(
                    {
                        "phase": "E4",
                        "source_path": source_path,
                        "source_chunk_id": warning.get("chunk_id"),
                    }
                ),
            ]
        )
    copy_columns(
        database_url,
        "legal_authority.extraction_warnings",
        [
            "extraction_warning_id",
            "corpus_build_id",
            "source_file_id",
            "warning_code",
            "warning_detail",
            "severity",
            "page",
            "metadata",
        ],
        extraction_warning_rows,
    )

    alias_unit_ids = {alias[1] for alias in alias_rows}
    audit_chunk = next(
        (
            chunk
            for chunk in chunk_payloads
            if chunk["black_letter_eligible"] and chunk["authority_unit_id"] in alias_unit_ids
        ),
        next((chunk for chunk in chunk_payloads if chunk["authority_unit_id"] in alias_unit_ids), chunk_payloads[0]),
    )
    audit_alias = next(
        (alias for alias in alias_rows if alias[1] == audit_chunk["authority_unit_id"]),
        None,
    )
    retrieval_log_id = stable_uuid("retrieval_log", load_batch_id)
    answer_audit_record_id = stable_uuid("answer_audit_record", load_batch_id)
    query_hash = hashlib.sha256(b"phase-e4-audit-reconstruction").hexdigest()
    copy_columns(
        database_url,
        "legal_authority.retrieval_logs",
        [
            "retrieval_log_id",
            "corpus_build_id",
            "query_hash",
            "retrieval_mode",
            "as_of_date",
            "filters",
            "detected_citations",
            "candidate_chunk_ids",
            "returned_chunk_ids",
            "scores",
            "rerank_features",
            "refused_before_generation",
        ],
        [
            [
                retrieval_log_id,
                corpus_build_id,
                query_hash,
                "exact_citation",
                "2026-06-16",
                "{}",
                "[]",
                pg_array([audit_chunk["authority_chunk_id"]]),
                pg_array([audit_chunk["authority_chunk_id"]]),
                "{}",
                "{}",
                False,
            ]
        ],
    )
    copy_columns(
        database_url,
        "legal_authority.answer_audit_records",
        [
            "answer_audit_record_id",
            "retrieval_log_id",
            "corpus_build_id",
            "model_provider",
            "model_name",
            "model_parameters",
            "retrieved_chunk_ids",
            "displayed_citation_alias_ids",
            "answer_hash",
            "trust_metadata",
            "validation_status",
            "unsupported_proposition_count",
        ],
        [
            [
                answer_audit_record_id,
                retrieval_log_id,
                corpus_build_id,
                "local",
                "no-generation",
                "{}",
                pg_array([audit_chunk["authority_chunk_id"]]),
                pg_array([audit_alias[0]]) if audit_alias else "{}",
                hashlib.sha256(b"no-answer-text-recorded").hexdigest(),
                json_metadata({"phase": "E4", "test": "audit_reconstruction", "answer_text_stored": False}),
                "passed",
                0,
            ]
        ],
    )
    if audit_alias:
        copy_columns(
            database_url,
            "legal_authority.citation_verification_records",
            [
                "citation_verification_record_id",
                "answer_audit_record_id",
                "retrieval_log_id",
                "citation_text",
                "normalized_citation",
                "citation_alias_id",
                "exists_in_corpus",
                "current_as_of_date",
                "display_allowed",
                "proposition_supported",
                "supporting_chunk_ids",
                "warnings",
            ],
            [
                [
                    stable_uuid("citation_verification_record", load_batch_id),
                    answer_audit_record_id,
                    retrieval_log_id,
                    audit_alias[4],
                    audit_alias[5],
                    audit_alias[0],
                    True,
                    False,
                    False,
                    None,
                    pg_array([audit_chunk["authority_chunk_id"]]),
                    json.dumps(
                        [
                            {
                                "code": "display_gate_pending",
                                "phase": "E4",
                            }
                        ],
                        separators=(",", ":"),
                    ),
                ]
            ],
        )

    alias_probe = audit_alias[5] if audit_alias else ""
    verification = run_target_verification(database_url, alias_probe, retrieval_log_id)
    promoted_counts = {
        "source_files": len(source_file_rows),
        "source_file_memberships": len(membership_rows),
        "authority_units": len(unit_rows),
        "authority_versions": len(version_rows),
        "authority_chunks": len(chunk_rows),
        "citation_aliases": len(alias_rows),
        "chunk_warnings": len(chunk_warning_rows),
        "extraction_warnings": len(extraction_warning_rows),
        "retrieval_logs": 1,
        "answer_audit_records": 1,
        "citation_verification_records": 1 if audit_alias else 0,
    }

    return {
        "executed": True,
        "promoted_counts": promoted_counts,
        "reconciliation": {
            "manifest_unique_sha256": len(manifest_by_sha),
            "manifest_membership_paths": len(source_path_rows),
            "expanded_chunks": len(chunks),
            "global_extraction_warnings": len(warnings.get("warnings") or []),
            "missing_source_chunk_count": missing_source_chunk_count,
            "duplicate_source_chunk_id_count": sum(1 for count in source_chunk_id_totals.values() if count > 1),
            "duplicate_source_chunk_row_count": sum(count for count in source_chunk_id_totals.values() if count > 1),
        },
        "identity_results": {
            "unresolved_unit_count": sum(1 for unit in unit_rows_by_key.values() if unit["identity_unresolved"]),
            "unresolved_chunk_count": unresolved_chunk_count,
            "document_anchored_unit_count": sum(
                1 for unit in unit_rows_by_key.values() if unit["identity_status"] == "document_anchored"
            ),
            "document_anchored_chunk_count": identity_status_chunk_counts.get("document_anchored", 0),
            "identity_status_chunk_counts": dict(identity_status_chunk_counts),
            "unresolved_by_family": dict(unresolved_by_family),
            "unresolved_by_chunk_type": dict(unresolved_by_chunk_type),
            "alias_collision_normalized_count": len(collision_norms),
            "alias_candidates_suppressed_by_collision": sum(
                1 for (_, normalized) in alias_candidates if normalized in collision_norms
            ),
        },
        "effectivity_status_counts_from_chunks": dict(effectivity_status_counts),
        "high_risk_version_key_count": len(high_risk_version_keys),
        "audit": {
            "retrieval_log_id": retrieval_log_id,
            "answer_audit_record_id": answer_audit_record_id,
            "audit_chunk_id": audit_chunk["authority_chunk_id"],
            "audit_alias_normalized": alias_probe,
        },
        "verification": verification,
        "body_text_printed": False,
    }



def run_target_verification(database_url: str, alias_probe: str, retrieval_log_id: str) -> dict[str, Any]:
    alias_probe_sql = sql_literal(alias_probe) if alias_probe else "''"
    retrieval_log_sql = sql_literal(retrieval_log_id)
    return {
        "counts_by_family": fetch_json(
            database_url,
            """
            select f.family_code, count(*)::int as chunk_count
            from legal_authority.authority_chunks c
            join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
            join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
            group by f.family_code
            order by f.family_code
            """,
        ),
        "counts_by_display_status": fetch_json(
            database_url,
            """
            select production_display_status::text as status, count(*)::int as chunk_count
            from legal_authority.authority_chunks
            group by production_display_status
            order by production_display_status::text
            """,
        ),
        "counts_by_answer_scope": fetch_json(
            database_url,
            """
            select answer_scope::text as answer_scope, count(*)::int as chunk_count
            from legal_authority.authority_chunks
            group by answer_scope
            order by answer_scope::text
            """,
        ),
        "counts_by_version_status": fetch_json(
            database_url,
            """
            select version_status::text as version_status, count(*)::int as version_count
            from legal_authority.authority_versions
            group by version_status
            order by version_status::text
            """,
        ),
        "dcs_membership": fetch_json(
            database_url,
            """
            select
              count(*)::int as membership_count,
              count(distinct dcs_chapter)::int as distinct_chapter_count,
              count(*) filter (where path_role = 'alias')::int as alias_path_count,
              count(*) filter (where path_role = 'primary')::int as primary_path_count,
              count(*) filter (where is_selected_for_build)::int as selected_path_count
            from legal_authority.source_file_memberships
            where dcs_chapter is not null
            """,
        ),
        "display_gate": {
            "displayable_view_count": fetch_int(
                database_url,
                "select count(*) from legal_authority.v_current_displayable_chunks",
            ),
            "restricted_in_displayable_view_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.v_current_displayable_chunks
                where production_display_status = 'restricted_pending_license_review'
                """,
            ),
            "pending_in_displayable_view_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.v_current_displayable_chunks
                where approval_status <> 'approved_for_production'
                """,
            ),
            "internal_qa_restricted_view_count": fetch_int(
                database_url,
                "select count(*) from legal_authority.v_internal_qa_restricted_chunks",
            ),
        },
        "black_letter": {
            "eligible_chunk_count": fetch_int(
                database_url,
                "select count(*) from legal_authority.authority_chunks where black_letter_eligible",
            ),
            "production_visible_black_letter_count": fetch_int(
                database_url,
                "select count(*) from legal_authority.v_black_letter_current_chunks",
            ),
        },
        "tre_scope": {
            "tre_chunk_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_chunks c
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
                where f.family_code = 'tenn_rules_evidence'
                """,
            ),
            "tre_limited_scope_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_chunks c
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
                where f.family_code = 'tenn_rules_evidence'
                  and c.answer_scope = 'limited_evidentiary_procedural'
                """,
            ),
            "tre_non_limited_scope_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_chunks c
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
                where f.family_code = 'tenn_rules_evidence'
                  and c.answer_scope <> 'limited_evidentiary_procedural'
                """,
            ),
        },
        "dcs_scope": {
            "dcs_chunk_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_chunks c
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
                where f.family_code = 'dcs_policies_procedures'
                """,
            ),
            "dcs_guardrail_scope_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_chunks c
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
                where f.family_code = 'dcs_policies_procedures'
                  and c.answer_scope = 'guardrail_reference_only'
                """,
            ),
            "dcs_production_eligible_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_chunks c
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
                where f.family_code = 'dcs_policies_procedures'
                  and c.approval_status = 'approved_for_production'
                  and c.production_display_status = 'displayable_policy_text'
                """,
            ),
        },
        "effectivity": {
            "future_version_count": fetch_int(
                database_url,
                "select count(*) from legal_authority.authority_versions where version_status = 'future_effective'",
            ),
            "current_with_future_end_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_versions
                where version_status = 'current'
                  and valid_to is not null
                """,
            ),
            "future_visible_before_2026_07_01_count": fetch_int(
                database_url,
                """
                select count(*)
                from legal_authority.authority_versions
                where version_status = 'future_effective'
                  and valid_from <= date '2026-06-16'
                """,
            ),
            "qa_signoff_required_count": fetch_int(
                database_url,
                "select count(*) from legal_authority.authority_versions where qa_signoff_required",
            ),
        },
        "citation_alias": {
            "alias_probe_present": bool(alias_probe),
            "internal_alias_join_count": fetch_int(
                database_url,
                f"""
                select count(*)
                from legal_authority.citation_aliases a
                join legal_authority.authority_chunks c on c.authority_unit_id = a.authority_unit_id
                where a.normalized_alias = {alias_probe_sql}
                """,
            )
            if alias_probe
            else 0,
            "production_lookup_count": fetch_int(
                database_url,
                f"select count(*) from legal_authority.lookup_citation_alias({alias_probe_sql}, date '2026-06-16')",
            )
            if alias_probe
            else 0,
        },
        "audit_reconstruction": {
            "join_count": fetch_int(
                database_url,
                f"""
                select count(*)
                from legal_authority.answer_audit_records aar
                join legal_authority.retrieval_logs rl on rl.retrieval_log_id = aar.retrieval_log_id
                join legal_authority.authority_chunks c on c.authority_chunk_id = any(rl.returned_chunk_ids)
                join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id
                join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
                join legal_authority.source_files sf on sf.source_file_id = c.source_file_id
                join legal_authority.corpus_builds cb on cb.corpus_build_id = aar.corpus_build_id
                where rl.retrieval_log_id = {retrieval_log_sql}
                  and sf.sha256 = c.metadata->>'source_hash'
                  and cb.corpus_build_id = rl.corpus_build_id
                """,
            ),
            "answer_text_column_count": fetch_int(
                database_url,
                """
                select count(*)
                from information_schema.columns
                where table_schema = 'legal_authority'
                  and table_name = 'answer_audit_records'
                  and column_name in ('answer_text', 'answer')
                """,
            ),
        },
    }


def query_counts(database_url: str) -> dict[str, int]:
    proc = run_command(
        [require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-At", "-F", ",", "-c", table_counts_sql()]
    )
    if proc.returncode != 0:
        raise RuntimeError(f"count query failed\n{proc.stderr}")
    counts: dict[str, int] = {}
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        key, value = line.split(",", 1)
        counts[key] = int(value)
    return counts


def create_database(name: str) -> None:
    createdb = shutil.which("createdb")
    if not createdb:
        raise RuntimeError("createdb is not available.")
    proc = run_command([createdb, name])
    if proc.returncode != 0:
        raise RuntimeError(f"createdb failed for {name}\n{proc.stderr}")


def drop_database(name: str) -> dict[str, Any]:
    dropdb = shutil.which("dropdb")
    if not dropdb:
        return {"dropped": False, "reason": "dropdb not available"}
    proc = run_command([dropdb, "--if-exists", name])
    return {"dropped": proc.returncode == 0, "stderr": proc.stderr.strip()}


def run_local_dry_run(args: argparse.Namespace, validation_report: dict[str, Any]) -> dict[str, Any]:
    created_database = False
    database_url = args.database_url or os.environ.get("BENCHBOOK_LOCAL_DATABASE_URL")

    if args.create_local_db:
        database_url = args.local_db_name or f"benchbook_e4_dry_run_{uuid.uuid4().hex[:10]}"
        create_database(database_url)
        created_database = True

    if not database_url:
        return {
            "executed": False,
            "reason": "No local database target provided.",
            "created_database": False,
            "dropped_database": False,
        }

    if not is_local_database_target(database_url):
        raise RuntimeError("Refusing non-local database target.")

    load_batch_id = str(uuid.uuid4())
    migration_results = apply_migrations(database_url) if args.apply_migrations else []
    corpus_build_id = insert_corpus_build(database_url, validation_report, load_batch_id)
    staged_counts = stage_inputs(database_url, load_batch_id)
    promotion_results = (
        {
            "executed": False,
            "reason": "Target promotion skipped by CLI option.",
        }
        if args.skip_target_promotion
        else promote_targets(database_url, validation_report, load_batch_id, corpus_build_id)
    )
    db_counts = query_counts(database_url)

    drop_result: dict[str, Any] = {"dropped": False, "reason": "drop-after not requested"}
    if args.drop_after and created_database:
        drop_result = drop_database(database_url)

    return {
        "executed": True,
        "database_target": database_url,
        "created_database": created_database,
        "load_batch_id": load_batch_id,
        "corpus_build_id": corpus_build_id,
        "draft_migrations_applied": len(migration_results),
        "migration_results": migration_results,
        "staged_counts": staged_counts,
        "target_promotion": promotion_results,
        "database_counts": db_counts,
        "drop_result": drop_result,
    }


def print_text(report: dict[str, Any]) -> None:
    print("BenchBook.AI Phase E4 local target-promotion dry-run loader")
    print("remote_database_connection: false")
    print("body_text_printed: false")
    print(f"static_expanded_chunks: {report['static_validation']['chunks']['total_chunks']}")
    print(f"static_text_hash_mismatches: {report['static_validation']['chunks']['text_hash_mismatch_count']}")
    print(f"static_candidate_blockers: {len(report['static_validation']['candidate_blockers'])}")
    db = report["local_database"]
    print(f"local_database_executed: {db['executed']}")
    if db["executed"]:
        print(f"created_database: {db['created_database']}")
        print(f"draft_migrations_applied: {db['draft_migrations_applied']}")
        print(f"staged_raw_source_manifest: {db['staged_counts']['raw_source_manifest']}")
        print(f"staged_raw_expanded_chunks: {db['staged_counts']['raw_expanded_chunks']}")
        print(f"staged_raw_extraction_warnings: {db['staged_counts']['raw_extraction_warnings']}")
        print(f"staged_raw_deduplication_groups: {db['staged_counts']['raw_deduplication_groups']}")
        promotion = db.get("target_promotion") or {}
        print(f"target_promotion_executed: {promotion.get('executed')}")
        if promotion.get("executed"):
            promoted = promotion.get("promoted_counts", {})
            verification = promotion.get("verification", {})
            print(f"promoted_source_files: {promoted.get('source_files')}")
            print(f"promoted_source_file_memberships: {promoted.get('source_file_memberships')}")
            print(f"promoted_authority_units: {promoted.get('authority_units')}")
            print(f"promoted_authority_versions: {promoted.get('authority_versions')}")
            print(f"promoted_authority_chunks: {promoted.get('authority_chunks')}")
            print(f"promoted_citation_aliases: {promoted.get('citation_aliases')}")
            print(f"promoted_chunk_warnings: {promoted.get('chunk_warnings')}")
            print(f"promoted_extraction_warnings: {promoted.get('extraction_warnings')}")
            print(
                "displayable_view_count: "
                f"{verification.get('display_gate', {}).get('displayable_view_count')}"
            )
            print(
                "future_visible_before_2026_07_01_count: "
                f"{verification.get('effectivity', {}).get('future_visible_before_2026_07_01_count')}"
            )
            print(
                "audit_reconstruction_join_count: "
                f"{verification.get('audit_reconstruction', {}).get('join_count')}"
            )
        print(f"dropped_database: {db['drop_result'].get('dropped')}")
    else:
        print(f"local_database_reason: {db['reason']}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print JSON report.")
    parser.add_argument("--static-only", action="store_true", help="Run validation only.")
    parser.add_argument("--database-url", help="Local database name or local PostgreSQL URL.")
    parser.add_argument("--create-local-db", action="store_true", help="Create a disposable local database.")
    parser.add_argument("--local-db-name", help="Name for --create-local-db.")
    parser.add_argument("--drop-after", action="store_true", help="Drop created local database after dry run.")
    parser.add_argument("--apply-migrations", action="store_true", default=True, help="Apply draft migrations before staging.")
    parser.add_argument("--skip-target-promotion", action="store_true", help="Stage raw inputs only.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    validation_report = build_report()
    if args.static_only:
        local_database = {
            "executed": False,
            "reason": "Static-only mode requested.",
            "created_database": False,
            "dropped_database": False,
        }
    else:
        local_database = run_local_dry_run(args, validation_report)

    report = {
        "static_validation": validation_report,
        "local_database": local_database,
        "remote_database_connection": False,
        "body_text_printed": False,
        "embeddings_generated": False,
    }

    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_text(report)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
