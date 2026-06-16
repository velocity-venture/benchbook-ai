#!/usr/bin/env python3
"""Local-only Phase E2 dry-run loader for the legal_authority schema.

The loader always runs static validation first. With a local database target, it
applies draft migrations and stages raw JSON into legal_authority_stage. It does
not connect to remote databases, generate embeddings, or print legal text.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import shutil
import subprocess
import sys
import uuid
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


def jsonl_rows(path: Path, load_batch_id: str) -> list[list[Any]]:
    rows: list[list[Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            obj = json.loads(line)
            rows.append([load_batch_id, line_number, json.dumps(obj, separators=(",", ":")), "pending"])
    return rows


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


def insert_corpus_build(database_url: str, validation_report: dict[str, Any], load_batch_id: str) -> None:
    manifest_sha = validation_report["manifest"]["file_sha256"]
    chunk_sha = validation_report["chunks"]["file_sha256"]
    pipeline = validation_report["summary"]["pipeline_version"] or "unknown"
    chunk_summary = json.dumps(validation_report["summary"], separators=(",", ":"))
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
        {sql_literal('phase-e2-local-' + load_batch_id)},
        'Phase E2 local disposable dry run',
        {sql_literal(manifest_sha)},
        {sql_literal(chunk_sha)},
        {sql_literal(pipeline)},
        '{{}}'::jsonb,
        {sql_literal(chunk_summary)}::jsonb,
        'pending_extraction_qa',
        'passed_with_warnings',
        now(),
        now(),
        'Local disposable dry-run staging only. Not production.'
      )
      on conflict (build_version) do nothing;
    """
    proc = psql(database_url, sql)
    if proc.returncode != 0:
        raise RuntimeError(f"corpus_builds insert failed\n{proc.stderr}")


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


def query_counts(database_url: str) -> dict[str, int]:
    sql = """
      select 'corpus_builds', count(*) from legal_authority.corpus_builds
      union all select 'authority_families', count(*) from legal_authority.authority_families
      union all select 'raw_source_manifest', count(*) from legal_authority_stage.raw_source_manifest
      union all select 'raw_expanded_chunks', count(*) from legal_authority_stage.raw_expanded_chunks
      union all select 'raw_extraction_warnings', count(*) from legal_authority_stage.raw_extraction_warnings
      union all select 'raw_deduplication_groups', count(*) from legal_authority_stage.raw_deduplication_groups
      order by 1;
    """
    proc = run_command([require_psql(), "-v", "ON_ERROR_STOP=1", "-d", database_url, "-At", "-F", ",", "-c", sql])
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
        database_url = args.local_db_name or f"benchbook_e2_dry_run_{uuid.uuid4().hex[:10]}"
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
    insert_corpus_build(database_url, validation_report, load_batch_id)
    staged_counts = stage_inputs(database_url, load_batch_id)
    db_counts = query_counts(database_url)

    drop_result: dict[str, Any] = {"dropped": False, "reason": "drop-after not requested"}
    if args.drop_after and created_database:
        drop_result = drop_database(database_url)

    return {
        "executed": True,
        "database_target": database_url,
        "created_database": created_database,
        "load_batch_id": load_batch_id,
        "draft_migrations_applied": len(migration_results),
        "migration_results": migration_results,
        "staged_counts": staged_counts,
        "database_counts": db_counts,
        "drop_result": drop_result,
    }


def print_text(report: dict[str, Any]) -> None:
    print("BenchBook.AI Phase E2 local dry-run loader")
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
