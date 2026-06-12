#!/usr/bin/env python3
"""BenchBook.AI Phase C pilot ingestion pipeline.

Converts the judge-authorized pilot set of source PDFs into raw extracted
text, structured Markdown, and JSONL authority chunks, with extraction and
chunk QA reports. Pilot/extraction-validation ONLY:

  - reads source PDFs strictly read-only (no move/rename/modify),
  - verifies every pilot file's SHA-256 against the source manifest before
    extraction (any mismatch aborts: stop-and-ask),
  - loads nothing into any database, generates no embeddings,
  - marks nothing production-ready; approval_status flows through from the
    manifest, corpus_designation is pilot_extraction_only (TRE:
    pending_judge_designation).

Chunking is by legal structure, never token count:
  Title 37            -> one unit per T.C.A. section; black-letter text,
                         history, commentary, annotations, and case notes
                         are separate chunks (annotations are NEVER merged
                         into black-letter text).
  Tenn. R. Juv. P.    -> one unit per rule, same block separation.
  Tenn. R. Evid.      -> one unit per rule, same block separation;
                         corpus_designation stays pending_judge_designation.
  DCS policies        -> page-1 header block (metadata) + body sections by
                         detected headings; whole-document fallback with a
                         warning when headings cannot be detected.

Anything the parser cannot reliably detect is left blank/unknown and recorded
as a warning — no overclaiming.

Usage (any Python 3.10+ with pypdf importable):
    python scripts/ingestion_pilot/run_pilot_ingestion.py

Exit codes: 0 ok; 2 manifest verification failure (stop-and-ask);
3 missing prerequisites (manifest/pilot file/extraction tool).
"""
from __future__ import annotations

import datetime
import hashlib
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    print("ERROR: pypdf not importable in this interpreter. Run with an "
          "interpreter that has pypdf (e.g. /tmp/bb_venv/bin/python). "
          "Do not install dependencies without authorization.", file=sys.stderr)
    sys.exit(3)

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MANIFEST_PATH = os.path.join(REPO, "data", "source-manifest", "SOURCE_MANIFEST.jsonl")
OUT_DIR = os.path.join(REPO, "data", "ingestion-pilot")
TEXT_DIR = os.path.join(OUT_DIR, "extracted-text")
MD_DIR = os.path.join(OUT_DIR, "structured-markdown")

PIPELINE_VERSION = "phase-c-pilot-1.0"
SHORT_PAGE_CHARS = 50
LARGE_CHUNK_CHARS = 12000

PILOT_FILES = [
    "Benchbook.ai Database Files/Title 37/37_1_101_37_1_201.pdf",
    "Benchbook.ai Database Files/Tenn. R. Juv. P. Rules.pdf",
    "Benchbook.ai Database Files/Tenn. R. Evid..pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch09_Child_Records/136_9.4_Confidential_Client-Specific_Information.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch09_Child_Records/138_9.5_Access_and_Release_of_Confidential_Child-Specific_Informatio.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/185_14.2_Screening_Priority_Response_and_Assignment_of_Child_Protecti.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/193_14.6_Child_Protective_Services_Case_Tasks_and_Responsibilities.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/202_14.7_Multi-Disciplinary_Team_Child_Protective_Investigative.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/215_14.12_Family_Permanency_Planning_for_Child_Protective_Services_Non.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/216_14.13_Non-Custodial_Immediate_Protection_Agreements.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/217_14.14_Removal_Safety_and_Permanency_Considerations.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/218_14.15_Confidentiality_of_Child_Protective_Services_Cases.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/225_14.20_Orders_of_Reference.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch14_CPS/228_14.30_Relative_Caregiver_Program.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch16A_Foster_Care/274_16.31_Permanency_Planning_for_Children_Youth_in_the_Department_of.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch16A_Foster_Care/281_16.32_Foster_Care_Review_and_Progress_Reports.pdf",
    "Benchbook.ai Database Files/DCS P&P/TN_DCS_Policies/Ch31_Field_Services/583_31.1_Family_Permanency_Plans.pdf",
]

# ---------------------------------------------------------------- utilities

WARNINGS: list[dict] = []


def warn(source_path: str, code: str, detail: str, page=None, chunk_id=None):
    WARNINGS.append({
        "source_path": source_path, "code": code, "detail": detail,
        "page": page, "chunk_id": chunk_id,
    })


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name)
    s = re.sub(r"[^A-Za-z0-9._-]+", "_", s).strip("_")
    return s


def garbled_score(text: str) -> float:
    if not text:
        return 0.0
    bad = text.count("�") + len(re.findall(r"\(cid:\d+\)", text))
    return bad / max(1, len(text))


def clean_lines(text: str) -> list[str]:
    return [ln.rstrip() for ln in text.split("\n")]


# ------------------------------------------------------------- extraction

def extract_pages(path: str, source_path: str):
    """Return list of (page_no_1based, text). Never writes to the PDF."""
    reader = PdfReader(path)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception as e:  # noqa: BLE001
            warn(source_path, "page_extraction_error", f"{type(e).__name__}: {e}", page=i)
            text = ""
        if len(text.strip()) < SHORT_PAGE_CHARS:
            warn(source_path, "suspiciously_short_page",
                 f"{len(text.strip())} chars of text on page {i}", page=i)
        g = garbled_score(text)
        if g > 0.001:
            warn(source_path, "garbled_text_suspected",
                 f"replacement/cid character ratio {g:.4f} on page {i}", page=i)
        pages.append((i, text))
    return pages


# ------------------------------------------- Lexis unit/block segmentation

LEXIS_BLOCK_MARKERS = {
    "History": "history",
    "Commentary": "advisory_comment",
    "Advisory Commission Comments": "advisory_comment",
    "Advisory Commission Comments.": "advisory_comment",
    "Advisory Commission Comment.": "advisory_comment",
    "Annotations": "annotation_candidate",
    "NOTES TO DECISIONS": "case_note_candidate",
    "Notes To Decisions": "case_note_candidate",
    "Case Notes": "case_note_candidate",
    "Research References & Practice Aids": "annotation_candidate",
    "Research References": "annotation_candidate",
    "End of Document": None,
}

PAGE_HEADER_RE = re.compile(r"^\s*Page \d+ of \d+\s*$")


def split_lexis_units(pages, unit_start_re, source_path):
    """Split a Lexis export into units. A unit starts on a page whose first
    non-blank line matches unit_start_re."""
    units = []
    current = None
    for pno, text in pages:
        lines = clean_lines(text)
        first = next((ln.strip() for ln in lines if ln.strip()), "")
        if unit_start_re.match(first):
            current = {"start_page": pno, "lines": []}
            units.append(current)
        elif current is None:
            warn(source_path, "preamble_before_first_unit",
                 "page precedes first recognized unit header; kept as unknown unit",
                 page=pno)
            current = {"start_page": pno, "lines": [], "preamble": True}
            units.append(current)
        current["lines"].extend((pno, ln) for ln in lines)
    return units


def parse_lexis_unit(unit, family, source_path, heading_re):
    """Parse one Lexis unit into header metadata + typed text blocks.

    Returns dict: citation_line, hierarchy_path, heading, blocks
    (list of (chunk_type, [(page, line), ...])).
    """
    lines = unit["lines"]
    n = len(lines)
    i = 0
    # skip blanks
    while i < n and not lines[i][1].strip():
        i += 1
    citation_line = lines[i][1].strip() if i < n else ""
    i += 1
    # currency banner
    if i < n and lines[i][1].strip().startswith("Current "):
        i += 1
    # hierarchy: "TN - ..." possibly wrapped over several lines, ends before heading
    hier_lines = []
    if i < n and lines[i][1].strip().startswith("TN - "):
        hier_lines.append(lines[i][1].strip())
        i += 1
        while i < n and lines[i][1].strip() and not heading_re.match(lines[i][1].strip()):
            hier_lines.append(lines[i][1].strip())
            i += 1
    hierarchy_path = [p.strip() for p in " ".join(hier_lines).split(">")] if hier_lines else []
    # heading (may wrap one extra line)
    heading = ""
    while i < n and not lines[i][1].strip():
        i += 1
    if i < n and heading_re.match(lines[i][1].strip()):
        heading = lines[i][1].strip()
        i += 1
        if (heading and not heading.endswith((".", ".]", "]"))
                and i < n and lines[i][1].strip()
                and not lines[i][1].strip().startswith("(")
                and lines[i][1].strip() not in LEXIS_BLOCK_MARKERS
                and len(lines[i][1].strip()) < 80):
            heading += " " + lines[i][1].strip()
            i += 1
    else:
        warn(source_path, "missing_section_heading",
             f"no heading matched after unit header {citation_line!r}",
             page=unit["start_page"])

    heading_stripped = re.sub(r"\s+", " ", heading)
    blocks = []
    current_type = "black_letter_text"
    current_lines = []

    def flush():
        nonlocal current_lines
        if any(ln.strip() for _p, ln in current_lines):
            blocks.append((current_type, current_lines))
        current_lines = []

    skip_next_heading_echo = False
    for pno, ln in lines[i:]:
        s = ln.strip()
        if PAGE_HEADER_RE.match(s):
            skip_next_heading_echo = True   # running header: "Page N of M" + echoed heading
            continue
        if skip_next_heading_echo:
            skip_next_heading_echo = False
            if s and re.sub(r"\s+", " ", s) in heading_stripped or (
                    heading_stripped and heading_stripped.startswith(re.sub(r"\s+", " ", s)[:40]) and len(s) < 120):
                continue  # echoed heading line
        if s in LEXIS_BLOCK_MARKERS:
            flush()
            mapped = LEXIS_BLOCK_MARKERS[s]
            if mapped is None:        # End of Document
                current_type = "black_letter_text"
                continue
            current_type = mapped
            continue
        current_lines.append((pno, ln))
    flush()
    return {
        "citation_line": citation_line,
        "hierarchy_path": hierarchy_path,
        "heading": heading_stripped,
        "blocks": blocks,
        "start_page": unit["start_page"],
        "preamble": unit.get("preamble", False),
    }


# ------------------------------------------------------------- DCS parsing

DCS_DOC_TYPES = {
    "POLICY": "policy_text", "PROTOCOL": "protocol", "GUIDE": "guide",
    "WORK AID": "work_aid", "MANUAL": "manual",
}
DCS_RUNNING_HEADER_PATTERNS = [
    re.compile(r"^\s*Act in the best interest of Tennessee.s children and youth\.?.*$"),
    re.compile(r"^\s*Page \d+ of \d+\s*$"),
    re.compile(r"^\s*RDA\s+SW?\d+\s*$"),
]
DCS_SECTION_RE = re.compile(r"^([A-Z])\.\s{1,3}(\S.{0,84})$")
DCS_NAMED_SECTION_RE = re.compile(
    r"^(Glossary|Procedures?|Forms?( and Attachments)?|Policy Statement|Purpose|"
    r"Standards?|Application|Collateral Documents?|Related Policies)\s*:?\s*$",
    re.IGNORECASE,
)
DCS_DATE_FIELDS = ["Original Effective Date", "Current Effective Date",
                   "Effective Date", "Supersedes", "Last Review Date"]


def parse_dcs(pages, source_path):
    """Parse a DCS policy PDF into header metadata + body sections."""
    first_text = pages[0][1] if pages else ""
    first_lines = [ln.strip() for ln in clean_lines(first_text) if ln.strip()]
    doc_type_word = first_lines[0].upper() if first_lines else ""
    chunk_type = DCS_DOC_TYPES.get(doc_type_word)
    if chunk_type is None:
        chunk_type = "policy_text"
        warn(source_path, "dcs_doc_type_undetected",
             f"first line {first_lines[0]!r} not a known DCS document type banner"
             if first_lines else "empty first page", page=1)

    policy_number, policy_title = "", ""
    for ln in first_lines[:12]:
        m = re.match(r"^(\d{1,2}\.\d{1,2}[A-Za-z]?)[ ,:]+(\S.*)$", ln)
        if m:
            policy_number, policy_title = m.group(1), m.group(2).strip()
            break
    if not policy_number:
        warn(source_path, "dcs_policy_number_undetected",
             "no 'N.N Title' line found on page 1", page=1)

    dates = {}
    joined_p1 = re.sub(r"\s+", " ", first_text)
    for field in DCS_DATE_FIELDS:
        m = re.search(re.escape(field) + r"\s*:\s*([0-9/]{6,10})", joined_p1)
        if m:
            dates[field] = m.group(1)
    if "Current Effective Date" not in dates and "Effective Date" not in dates:
        warn(source_path, "dcs_effective_date_undetected",
             "no effective date found on page 1", page=1)

    # body lines with running headers stripped; page-1 header block kept separate
    header_lines, body_lines = [], []
    for pno, text in pages:
        for ln in clean_lines(text):
            s = ln.strip()
            if any(p.match(s) for p in DCS_RUNNING_HEADER_PATTERNS):
                continue
            if pno >= 2 and policy_number and s.endswith(policy_number) and len(s) < 110:
                continue  # running title echo: "<Title> 14.14"
            target = header_lines if pno == 1 else body_lines
            target.append((pno, ln))

    # split page-1 block: metadata header ends where Glossary/first section starts
    split_idx = None
    for idx, (_p, ln) in enumerate(header_lines):
        s = ln.strip()
        if DCS_NAMED_SECTION_RE.match(s) or DCS_SECTION_RE.match(s):
            split_idx = idx
            break
    if split_idx is not None:
        body_lines = header_lines[split_idx:] + body_lines
        header_lines = header_lines[:split_idx]

    # body sections by headings
    sections = []
    cur_title, cur_lines = None, []

    def flush():
        if any(ln.strip() for _p, ln in cur_lines):
            sections.append((cur_title, list(cur_lines)))

    for pno, ln in body_lines:
        s = ln.strip()
        m = DCS_SECTION_RE.match(s)
        named = DCS_NAMED_SECTION_RE.match(s)
        if m or named:
            flush()
            cur_title = s
            cur_lines = []
            continue
        cur_lines.append((pno, ln))
    flush()

    if len(sections) <= 1:
        warn(source_path, "dcs_sections_undetected",
             f"only {len(sections)} body section(s) detected; emitting whole-document chunk")
    return {
        "chunk_type": chunk_type,
        "policy_number": policy_number,
        "policy_title": policy_title,
        "dates": dates,
        "header_lines": header_lines,
        "sections": sections,
    }


# ------------------------------------------------------------- chunk emit

def block_text(lines) -> str:
    text = "\n".join(ln for _p, ln in lines)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def page_span(lines):
    ps = [p for p, ln in lines if ln.strip()]
    return (min(ps), max(ps)) if ps else (None, None)


def make_chunk(seq_key: str, manifest_entry: dict, **fields) -> dict:
    base = {
        "chunk_id": "",
        "source_manifest_sha256": manifest_entry["sha256"],
        "source_path": manifest_entry["relative_path"],
        "source_type": manifest_entry["source_type"],
        "authority_family": manifest_entry["authority_family"],
        "corpus_designation": ("pending_judge_designation"
                               if manifest_entry["authority_family"] == "tenn_rules_evidence"
                               else "pilot_extraction_only"),
        "approval_status": manifest_entry["approval_status"],
        "canonical_citation": "", "citation_aliases": [],
        "title": "", "chapter": "", "part": "", "section": "", "subsection": "",
        "rule_number": "", "policy_number": "", "policy_chapter": "",
        "chunk_type": "unknown",
        "page_start": None, "page_end": None,
        "hierarchy_path": [], "text": "", "text_sha256": "",
        "extraction_warnings": [],
    }
    base.update(fields)
    base["text_sha256"] = sha256_bytes(base["text"].encode("utf-8"))
    base["chunk_id"] = "bb-pilot-" + sha256_bytes(
        f"{manifest_entry['sha256']}:{seq_key}".encode("utf-8"))[:24]
    return base


def lexis_chunks(parsed_units, manifest_entry, family, source_path):
    chunks = []
    for u in parsed_units:
        cite_line = u["citation_line"]
        canonical, aliases = "", []
        section = rule_number = chapter = part = title37 = ""
        if family == "tca_title_37":
            m = re.search(r"§\s*(\d+-\d+-\d+)", cite_line)
            if m:
                section = m.group(1)
                canonical = f"Tenn. Code Ann. § {section}"
                aliases = [f"T.C.A. § {section}", f"TCA {section}", f"TCA § {section}"]
            for h in u["hierarchy_path"]:
                if h.startswith("Title "):
                    title37 = h
                elif h.startswith("Chapter "):
                    chapter = h
                elif h.startswith("Part "):
                    part = h
        elif family == "tenn_rules_juvenile_practice_procedure":
            m = re.search(r"Rule\s+(\d+[A-Za-z]?)", cite_line)
            if m:
                rule_number = m.group(1)
                canonical = f"Tenn. R. Juv. P. {rule_number}"
                aliases = [f"Tenn. R. Juv. P. Rule {rule_number}", f"TRJPP {rule_number}"]
        elif family == "tenn_rules_evidence":
            m = re.search(r"Rule\s+(\d+\.?\d*[A-Za-z]?)", cite_line)
            if m:
                rule_number = m.group(1)
                canonical = f"Tenn. R. Evid. {rule_number}"
                aliases = [f"Tenn. R. Evid. Rule {rule_number}", f"TRE {rule_number}"]
            for h in u["hierarchy_path"]:
                if h.upper().startswith("ARTICLE"):
                    chapter = h
        if not canonical and not u.get("preamble"):
            warn(source_path, "citation_undetected",
                 f"could not parse canonical citation from {cite_line!r}; "
                 "fields left blank", page=u["start_page"])

        unit_key = canonical or f"unit-p{u['start_page']}"
        type_counter = Counter()
        for ctype, lines in u["blocks"]:
            text = block_text(lines)
            if not text:
                warn(source_path, "empty_chunk_skipped",
                     f"{unit_key} {ctype} block empty after cleanup",
                     page=u["start_page"])
                continue
            type_counter[ctype] += 1
            ps, pe = page_span(lines)
            cw = []
            if u.get("preamble"):
                ctype = "unknown"
                cw.append("preamble_before_first_unit")
            if len(text) > LARGE_CHUNK_CHARS:
                cw.append(f"unusually_large_chunk:{len(text)}_chars")
            ch = make_chunk(
                f"{unit_key}:{ctype}:{type_counter[ctype]}", manifest_entry,
                canonical_citation=canonical, citation_aliases=aliases,
                title=u["heading"], chapter=chapter, part=part,
                section=section, rule_number=rule_number,
                chunk_type=ctype, page_start=ps, page_end=pe,
                hierarchy_path=u["hierarchy_path"], text=text,
                extraction_warnings=cw,
            )
            if title37:
                ch["title"] = u["heading"]  # heading is the section title; Title 37 itself:
                ch["chapter"] = chapter
            for w in cw:
                warn(source_path, w.split(":")[0], f"{unit_key} ({ctype})",
                     page=ps, chunk_id=ch["chunk_id"])
            chunks.append(ch)
    return chunks


def dcs_chunks(parsed, manifest_entry, source_path):
    chunks = []
    rel = manifest_entry["relative_path"]
    m = re.search(r"TN_DCS_Policies/([^/]+)/", rel)
    policy_chapter = m.group(1) if m else ""
    pn = parsed["policy_number"]
    canonical = f"DCS Policy {pn}" if pn else ""
    aliases = [f"DCS {pn}", f"Policy {pn}"] if pn else []
    dates_note = "; ".join(f"{k}: {v}" for k, v in parsed["dates"].items())

    def emit(seq_key, ctype, lines, section_title=""):
        text = block_text(lines)
        if not text:
            warn(source_path, "empty_chunk_skipped", f"{seq_key} empty after cleanup")
            return
        ps, pe = page_span(lines)
        cw = []
        if len(text) > LARGE_CHUNK_CHARS:
            cw.append(f"unusually_large_chunk:{len(text)}_chars")
        ch = make_chunk(
            seq_key, manifest_entry,
            canonical_citation=canonical, citation_aliases=aliases,
            title=parsed["policy_title"], section=section_title,
            policy_number=pn, policy_chapter=policy_chapter,
            chunk_type=ctype, page_start=ps, page_end=pe,
            hierarchy_path=[p for p in ["DCS Policies and Procedures",
                                        policy_chapter,
                                        f"{pn} {parsed['policy_title']}".strip()] if p],
            text=text + (f"\n\n[Document dates — {dates_note}]" if dates_note and ctype == "metadata" else ""),
            extraction_warnings=cw,
        )
        for w in cw:
            warn(source_path, w.split(":")[0], seq_key, page=ps, chunk_id=ch["chunk_id"])
        chunks.append(ch)

    if parsed["header_lines"]:
        emit(f"{canonical or rel}:header", "metadata", parsed["header_lines"],
             section_title="Document header (application/authority/dates)")
    for idx, (sec_title, lines) in enumerate(parsed["sections"], start=1):
        emit(f"{canonical or rel}:section:{idx}:{sec_title or 'untitled'}",
             parsed["chunk_type"], lines, section_title=sec_title or "")
    return chunks


# ---------------------------------------------------------------- markdown

def write_markdown(slug, manifest_entry, chunks, extra_meta=None):
    lines = [f"# {manifest_entry['relative_path']}", ""]
    lines += [
        "| | |", "|---|---|",
        f"| Source SHA-256 | `{manifest_entry['sha256']}` |",
        f"| Source type | {manifest_entry['source_type']} |",
        f"| Authority family | {manifest_entry['authority_family']} |",
        f"| Approval status | {manifest_entry['approval_status']} |",
        f"| Corpus designation | {chunks[0]['corpus_designation'] if chunks else 'n/a'} |",
        "", "> Pilot extraction output for human review — NOT production-ready, "
        "NOT an approved authority text.", "",
    ]
    if extra_meta:
        for k, v in extra_meta.items():
            lines.append(f"- **{k}:** {v}")
        lines.append("")
    for ch in chunks:
        head = ch["canonical_citation"] or ch["title"] or ch["chunk_id"]
        pages = (f"pp. {ch['page_start']}–{ch['page_end']}"
                 if ch["page_start"] else "pages unknown")
        lines.append(f"## {head} — {ch['chunk_type']} ({pages})")
        if ch["title"] and ch["canonical_citation"]:
            lines.append(f"**{ch['title']}**")
        if ch["extraction_warnings"]:
            lines.append(f"*Warnings: {', '.join(ch['extraction_warnings'])}*")
        lines += ["", ch["text"], ""]
    path = os.path.join(MD_DIR, slug + ".md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    return os.path.relpath(path, REPO)


# --------------------------------------------------------------------- main

def main() -> int:
    if not os.path.isfile(MANIFEST_PATH):
        print("ERROR: source manifest not found:", MANIFEST_PATH, file=sys.stderr)
        return 3
    manifest = {}
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        for line in f:
            e = json.loads(line)
            manifest[e["relative_path"]] = e

    generated_at = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    os.makedirs(TEXT_DIR, exist_ok=True)
    os.makedirs(MD_DIR, exist_ok=True)

    # ---- selection + verification (stop-and-ask on any failure)
    selection, failures = [], []
    for rel in PILOT_FILES:
        entry = {"relative_path": rel, "in_manifest": False, "on_disk": False,
                 "hash_match": False}
        me = manifest.get(rel)
        full = os.path.join(REPO, rel)
        entry["in_manifest"] = me is not None
        entry["on_disk"] = os.path.isfile(full)
        if me and entry["on_disk"]:
            current = sha256_file(full)
            entry["hash_match"] = current == me["sha256"]
            entry["sha256"] = me["sha256"]
            entry["source_type"] = me["source_type"]
            entry["authority_family"] = me["authority_family"]
            entry["approval_status"] = me["approval_status"]
        if not (entry["in_manifest"] and entry["on_disk"] and entry["hash_match"]):
            failures.append(entry)
        selection.append(entry)

    with open(os.path.join(OUT_DIR, "PILOT_SOURCE_SELECTION.json"), "w") as f:
        json.dump({"generated_at": generated_at,
                   "pipeline_version": PIPELINE_VERSION,
                   "pilot_file_count": len(PILOT_FILES),
                   "verification_failures": failures,
                   "selection": selection}, f, indent=2)
        f.write("\n")
    if failures:
        print("STOP-AND-ASK: pilot source verification failed:", file=sys.stderr)
        for x in failures:
            print("  ", x, file=sys.stderr)
        return 2

    # ---- per-file extraction + chunking
    all_chunks = []
    extraction_manifest = []
    for rel in PILOT_FILES:
        me = manifest[rel]
        full = os.path.join(REPO, rel)
        slug = slugify(os.path.splitext(os.path.basename(rel))[0])
        family = me["authority_family"]
        record = {"relative_path": rel, "sha256": me["sha256"],
                  "authority_family": family, "source_type": me["source_type"],
                  "extraction_tool": "pypdf", "status": "extracted",
                  "page_count": 0, "char_count": 0, "ocr_needed": False,
                  "raw_text_output": None, "markdown_output": None,
                  "chunk_count": 0}
        try:
            pages = extract_pages(full, rel)
        except Exception as e:  # noqa: BLE001
            record["status"] = "extraction_failed"
            record["error"] = f"{type(e).__name__}: {e}"
            warn(rel, "extraction_failed", record["error"])
            extraction_manifest.append(record)
            continue
        record["page_count"] = len(pages)
        record["char_count"] = sum(len(t) for _p, t in pages)
        if record["char_count"] < 200 * max(1, len(pages)) // 10:
            # essentially no embedded text: would need OCR — do not OCR silently
            record["status"] = "ocr_needed_not_run"
            record["ocr_needed"] = True
            warn(rel, "ocr_needed", "no/near-no embedded text; OCR not run in pilot")
            extraction_manifest.append(record)
            continue

        # raw text for audit
        txt_path = os.path.join(TEXT_DIR, slug + ".txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            for pno, text in pages:
                f.write(f"\n===== [page {pno}] =====\n")
                f.write(text + "\n")
        record["raw_text_output"] = os.path.relpath(txt_path, REPO)

        # structure-aware chunking
        extra_meta = None
        if family == "tca_title_37":
            units = split_lexis_units(
                pages, re.compile(r"^Tenn\. Code Ann\. § \d+-\d+-\d+"), rel)
            parsed = [parse_lexis_unit(u, family, rel,
                                       re.compile(r"^\d+-\d+-\d+\.")) for u in units]
            chunks = lexis_chunks(parsed, me, family, rel)
        elif family == "tenn_rules_juvenile_practice_procedure":
            units = split_lexis_units(
                pages, re.compile(r"^Tenn\. R\. Juv\. P\."), rel)
            parsed = [parse_lexis_unit(u, family, rel,
                                       re.compile(r"^Rule \d+[A-Za-z]?\.")) for u in units]
            chunks = lexis_chunks(parsed, me, family, rel)
        elif family == "tenn_rules_evidence":
            units = split_lexis_units(
                pages, re.compile(r"^Tenn\. R\. Evid\."), rel)
            parsed = [parse_lexis_unit(u, family, rel,
                                       re.compile(r"^(Rule \d+\.?\d*[A-Za-z]?\.|Note\b)")) for u in units]
            chunks = lexis_chunks(parsed, me, family, rel)
        elif family == "dcs_policies_procedures":
            parsed = parse_dcs(pages, rel)
            chunks = dcs_chunks(parsed, me, rel)
            extra_meta = {"Policy number": parsed["policy_number"] or "(undetected)",
                          "Policy title": parsed["policy_title"] or "(undetected)",
                          **parsed["dates"]}
        else:
            warn(rel, "unsupported_family", family)
            chunks = []

        if not chunks:
            warn(rel, "no_chunks_emitted", "file extracted but produced no chunks")
            record["status"] = "extracted_no_chunks"
        record["chunk_count"] = len(chunks)
        if chunks:
            record["markdown_output"] = write_markdown(slug, me, chunks, extra_meta)
        all_chunks.extend(chunks)
        extraction_manifest.append(record)

    # ---- cross-chunk QA
    by_text = defaultdict(list)
    for ch in all_chunks:
        by_text[ch["text_sha256"]].append(ch["chunk_id"])
    duplicate_groups = {h: ids for h, ids in by_text.items() if len(ids) > 1}
    for h, ids in duplicate_groups.items():
        warn("(cross-file)", "duplicate_chunk_text",
             f"{len(ids)} chunks share text hash {h[:16]}…: {ids}")

    sizes = sorted(len(c["text"]) for c in all_chunks) or [0]
    summary = {
        "generated_at": generated_at,
        "pipeline_version": PIPELINE_VERSION,
        "sources_selected": len(PILOT_FILES),
        "sources_extracted": sum(1 for r in extraction_manifest if r["status"] == "extracted"),
        "sources_failed_or_ocr": [r["relative_path"] for r in extraction_manifest
                                  if r["status"] != "extracted"],
        "total_chunks": len(all_chunks),
        "chunks_by_authority_family": dict(sorted(Counter(
            c["authority_family"] for c in all_chunks).items())),
        "chunks_by_chunk_type": dict(sorted(Counter(
            c["chunk_type"] for c in all_chunks).items())),
        "chunks_by_corpus_designation": dict(sorted(Counter(
            c["corpus_designation"] for c in all_chunks).items())),
        "chunk_size_chars": {"min": sizes[0], "median": sizes[len(sizes)//2],
                             "max": sizes[-1]},
        "chunks_with_warnings": sum(1 for c in all_chunks if c["extraction_warnings"]),
        "duplicate_text_groups": len(duplicate_groups),
        "empty_chunks_emitted": 0,
        "warning_count": len(WARNINGS),
        "warning_counts_by_code": dict(sorted(Counter(w["code"] for w in WARNINGS).items())),
    }

    with open(os.path.join(OUT_DIR, "PILOT_AUTHORITY_CHUNKS.jsonl"), "w") as f:
        for ch in all_chunks:
            f.write(json.dumps(ch, ensure_ascii=False) + "\n")
    with open(os.path.join(OUT_DIR, "PILOT_EXTRACTION_MANIFEST.json"), "w") as f:
        json.dump({"generated_at": generated_at,
                   "pipeline_version": PIPELINE_VERSION,
                   "extraction_tool_chain": {
                       "selected": "pypdf (only available local extractor)",
                       "pdftotext": "absent", "pdfplumber": "absent",
                       "pymupdf": "absent",
                       "ocr": "ocrmypdf/tesseract present but not used (no image-only pages)"},
                   "files": extraction_manifest}, f, indent=2)
        f.write("\n")
    with open(os.path.join(OUT_DIR, "PILOT_CHUNK_SUMMARY.json"), "w") as f:
        json.dump(summary, f, indent=2)
        f.write("\n")
    with open(os.path.join(OUT_DIR, "PILOT_EXTRACTION_WARNINGS.json"), "w") as f:
        json.dump({"generated_at": generated_at,
                   "warning_count": len(WARNINGS),
                   "warnings": WARNINGS}, f, indent=2)
        f.write("\n")

    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
