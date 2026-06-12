#!/usr/bin/env python3
"""Build the BenchBook.AI source-of-record manifest (Phase A/B).

Inventories and SHA-256-hashes every file under the source folder
("Benchbook.ai Database Files/"), classifies each file by source type and
authority family, and writes machine-readable manifest outputs plus anomaly
reports. Strictly read-only with respect to the source folder: no extraction,
no ingestion, no modification, no move/rename/delete.

Outputs (under data/source-manifest/):
  SOURCE_MANIFEST.jsonl          one JSON object per file, sorted by relative_path
  SOURCE_MANIFEST_SUMMARY.json   counts, anomaly summary, verification result
  SOURCE_MANIFEST_DUPLICATES.json  groups of files sharing a SHA-256
  SOURCE_MANIFEST_UNKNOWN_FILES.json files classified unknown/excluded + anomalies

Usage:
  python3 scripts/source_manifest/build_source_manifest.py
  python3 scripts/source_manifest/build_source_manifest.py \
      --verify-against docs/architecture-review/APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt

Exit codes: 0 success; 2 verification discrepancy (stop-and-ask condition);
3 source folder missing/empty.

Requires only the Python 3 standard library.
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import os
import sys
from collections import Counter, defaultdict

MANIFEST_VERSION = "1.1"
SOURCE_ROOT_NAME = "Benchbook.ai Database Files"
LARGE_FILE_BYTES = 10 * 1024 * 1024  # flag files over 10 MB as unusually large

# Expected closed universe: top-level entries of the source folder.
EXPECTED_TOP_LEVEL = {
    "Title 36",
    "Title 37",
    "DCS P&P",
    "Tenn. R. Evid..pdf",
    "Tenn. R. Juv. P. Rules.pdf",
}

RULE_FILES = {
    "Tenn. R. Evid..pdf": "tenn_rules_evidence",
    "Tenn. R. Juv. P. Rules.pdf": "tenn_rules_juvenile_practice_procedure",
}

METADATA_BASENAMES_LOWER = {"start_here.txt", "readme", "readme.md", "readme.txt"}
METADATA_EXTENSIONS = {".csv", ".txt", ".md", ".json"}


def repo_root() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def classify(rel_path: str, ext: str) -> tuple[str, str, str | None, str]:
    """Return (source_type, authority_family, authority_range_label, note)."""
    basename = os.path.basename(rel_path)
    stem = os.path.splitext(basename)[0]

    if rel_path.startswith("Title 36/"):
        if ext == ".pdf":
            return "statute", "tca_title_36", stem, ""
        return "unknown", "unknown", None, "Non-PDF file inside Title 36 folder."
    if rel_path.startswith("Title 37/"):
        if ext == ".pdf":
            return "statute", "tca_title_37", stem, ""
        return "unknown", "unknown", None, "Non-PDF file inside Title 37 folder."
    if basename in RULE_FILES and "/" not in rel_path:
        return "rule", RULE_FILES[basename], None, ""
    if rel_path.startswith("DCS P&P/"):
        if ext == ".pdf":
            return "dcs_policy", "dcs_policies_procedures", None, ""
        if basename.lower() in METADATA_BASENAMES_LOWER or ext in METADATA_EXTENSIONS:
            return "metadata", "metadata", None, "Index/readme/provenance file in DCS tree."
        return "unknown", "unknown", None, "Unclassifiable non-PDF in DCS tree."
    # Anything else is outside the expected layout — never guess.
    return "unknown", "unknown", None, "Outside expected closed-universe layout."


def dcs_chapter(rel_path: str) -> str | None:
    parts = rel_path.split("/")
    if len(parts) >= 4 and parts[0] == "DCS P&P" and parts[2].startswith("Ch"):
        return parts[2]
    return None


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_prior_hashes(path: str) -> dict[str, str]:
    """Parse a shasum-style record (hash<2 spaces>path), ignoring comments."""
    prior = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            digest, p = line.split("  ", 1)
            p = p.replace(SOURCE_ROOT_NAME + "/", "", 1)
            prior[p] = digest.lower()
    return prior


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--source-root", default=None,
                    help=f"Path to the source folder (default: <repo>/{SOURCE_ROOT_NAME})")
    ap.add_argument("--out-dir", default=None,
                    help="Output directory (default: <repo>/data/source-manifest)")
    ap.add_argument("--verify-against", default=None,
                    help="Prior shasum-style hash record to verify against (e.g. Appendix A). "
                         "Any mismatch/addition/deletion exits 2 (stop-and-ask).")
    args = ap.parse_args()

    root = repo_root()
    src = args.source_root or os.path.join(root, SOURCE_ROOT_NAME)
    out_dir = args.out_dir or os.path.join(root, "data", "source-manifest")

    if not os.path.isdir(src):
        print(f"ERROR: source folder not found: {src}", file=sys.stderr)
        return 3

    generated_at = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

    rel_paths = []
    for dirpath, _dirnames, filenames in os.walk(src):
        for name in filenames:
            full = os.path.join(dirpath, name)
            rel_paths.append(os.path.relpath(full, src).replace(os.sep, "/"))
    rel_paths.sort()
    if not rel_paths:
        print(f"ERROR: source folder is empty: {src}", file=sys.stderr)
        return 3

    entries = []
    by_hash = defaultdict(list)
    anomalies = {
        "non_pdf_files": [],
        "empty_files": [],
        "unusually_large_files": [],
        "unknown_files": [],
        "excluded_files": [],
        "unexpected_top_level_entries": sorted(
            {p.split("/")[0] for p in rel_paths} - EXPECTED_TOP_LEVEL
        ),
    }

    for rel in rel_paths:
        full = os.path.join(src, rel)
        size = os.path.getsize(full)
        ext = os.path.splitext(rel)[1].lower()
        digest = sha256_of(full)
        source_type, family, range_label, note = classify(rel, ext)

        notes = [note] if note else []
        chapter = dcs_chapter(rel)
        if chapter:
            notes.append(f"DCS chapter folder: {chapter}")

        if source_type in ("metadata", "excluded"):
            approval = "not_required_" + source_type
        else:
            approval = "pending_judge_approval"

        corpus_designation = None
        if family == "tenn_rules_evidence":
            corpus_designation = "pending_judge_designation"
            notes.append(
                "Tenn. R. Evid.: NOT designated an answer-corpus source; "
                "answer/guardrail designation awaits the Judge."
            )

        entry = {
            "manifest_version": MANIFEST_VERSION,
            "generated_at": generated_at,
            "relative_path": f"{SOURCE_ROOT_NAME}/{rel}",
            "filename": os.path.basename(rel),
            "extension": ext,
            "size_bytes": size,
            "sha256": digest,
            "source_root": SOURCE_ROOT_NAME,
            "source_type": source_type,
            "authority_family": family,
            "authority_range_label": range_label,
            "approval_status": approval,
            "corpus_designation": corpus_designation,
            "storage_status": "source_of_record_candidate",
            "notes": " ".join(notes),
        }
        entries.append(entry)
        by_hash[digest].append(entry["relative_path"])

        if ext != ".pdf":
            anomalies["non_pdf_files"].append(entry["relative_path"])
        if size == 0:
            anomalies["empty_files"].append(entry["relative_path"])
        if size > LARGE_FILE_BYTES:
            anomalies["unusually_large_files"].append(
                {"relative_path": entry["relative_path"], "size_bytes": size}
            )
        if source_type == "unknown":
            anomalies["unknown_files"].append(
                {"relative_path": entry["relative_path"], "reason": note}
            )
        if source_type == "excluded":
            anomalies["excluded_files"].append(
                {"relative_path": entry["relative_path"], "reason": note}
            )

    duplicates = [
        {"sha256": d, "count": len(paths), "relative_paths": paths}
        for d, paths in sorted(by_hash.items())
        if len(paths) > 1
    ]

    verification = None
    if args.verify_against:
        prior = load_prior_hashes(args.verify_against)
        current = {e["relative_path"].replace(SOURCE_ROOT_NAME + "/", "", 1): e["sha256"]
                   for e in entries}
        mismatches = sorted(
            p for p in prior.keys() & current.keys() if prior[p] != current[p]
        )
        additions = sorted(current.keys() - prior.keys())
        deletions = sorted(prior.keys() - current.keys())
        verification = {
            "verified_against": os.path.relpath(os.path.abspath(args.verify_against), root),
            "verified_at": generated_at,
            "prior_entries": len(prior),
            "current_files": len(current),
            "files_matched": len(current) - len(mismatches) - len(additions),
            "mismatches": mismatches,
            "additions": additions,
            "deletions": deletions,
            "result": "EXACT_MATCH" if not (mismatches or additions or deletions)
                      else "DISCREPANCY",
        }

    summary = {
        "manifest_version": MANIFEST_VERSION,
        "generated_at": generated_at,
        "generator": "scripts/source_manifest/build_source_manifest.py",
        "source_root": SOURCE_ROOT_NAME,
        "source_root_abspath": os.path.abspath(src),
        "total_files": len(entries),
        "total_bytes": sum(e["size_bytes"] for e in entries),
        "counts_by_source_type": dict(sorted(Counter(e["source_type"] for e in entries).items())),
        "counts_by_authority_family": dict(sorted(Counter(e["authority_family"] for e in entries).items())),
        "counts_by_approval_status": dict(sorted(Counter(e["approval_status"] for e in entries).items())),
        "counts_by_extension": dict(sorted(Counter(e["extension"] for e in entries).items())),
        "duplicate_hash_groups": len(duplicates),
        "anomaly_counts": {k: len(v) for k, v in anomalies.items()},
        "anomalies": anomalies,
        "hash_verification": verification,
    }

    os.makedirs(out_dir, exist_ok=True)

    def write_json(name: str, obj) -> str:
        path = os.path.join(out_dir, name)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2, ensure_ascii=False)
            f.write("\n")
        return path

    jsonl_path = os.path.join(out_dir, "SOURCE_MANIFEST.jsonl")
    with open(jsonl_path, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    write_json("SOURCE_MANIFEST_SUMMARY.json", summary)
    write_json("SOURCE_MANIFEST_DUPLICATES.json",
               {"generated_at": generated_at, "duplicate_groups": duplicates})
    write_json("SOURCE_MANIFEST_UNKNOWN_FILES.json", {
        "generated_at": generated_at,
        "unknown_files": anomalies["unknown_files"],
        "excluded_files": anomalies["excluded_files"],
        "unexpected_top_level_entries": anomalies["unexpected_top_level_entries"],
    })

    print(f"manifest entries : {len(entries)}")
    print(f"by source type   : {summary['counts_by_source_type']}")
    print(f"by family        : {summary['counts_by_authority_family']}")
    print(f"duplicates       : {len(duplicates)} group(s)")
    print(f"anomaly counts   : {summary['anomaly_counts']}")
    if verification:
        print(f"hash verification: {verification['result']} "
              f"(matched {verification['files_matched']}/{verification['current_files']})")
    print(f"outputs written to {out_dir}")

    if verification and verification["result"] != "EXACT_MATCH":
        print("STOP-AND-ASK: hash verification discrepancy detected.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
