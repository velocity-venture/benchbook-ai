#!/usr/bin/env python3
"""BenchBook.AI Phase C expansion ingestion pipeline.

Extraction/chunking ONLY, for the judge-approved Phase C expansion source set:
Title 36 (all), Title 37 (all), Tenn. R. Juv. P., Tenn. R. Evid., and DCS
staged chapters Ch09/Ch14/Ch16A/Ch16B/Ch31. Selection is driven by
data/source-manifest/SOURCE_MANIFEST.jsonl — never a hardcoded file list.

Guarantees:
  - source PDFs are read-only (verified by SHA-256 against the manifest
    immediately before extraction; any mismatch aborts: stop-and-ask);
  - no database load, no embeddings, no app-code changes, no production
    corpus replacement; nothing here is production-ready;
  - DCS files duplicated by SHA-256 within the staged set are chunked ONCE
    (primary = lexicographically first path); alias paths are preserved in
    the deduplication report;
  - LexisNexis annotations / case notes / AG opinions / editorial matter are
    emitted as separate chunk types and marked
    production_display_status=restricted_pending_license_review — never
    merged into black-letter law;
  - chunking is by legal structure (T.C.A. section / rule / DCS document
    section), never token count. Oversized case-note compilations are
    sub-split at their numbered note headings.

Designations (judge's Phase C expansion decisions, 2026-06):
  Title 36 / Title 37 / TRJPP -> corpus_designation core_v1_candidate
  TRE  -> evidence_guardrail_and_limited_answer_candidate (+ answer_scope_note)
  DCS  -> staged_dcs_candidate
  all  -> approval_status pending_extraction_qa

Run with any Python 3.10+ interpreter that can import pypdf
(see scripts/ingestion/requirements.txt). No scratch paths are hardcoded.

Exit codes: 0 ok; 2 manifest verification failure (stop-and-ask);
3 missing prerequisites.
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
    print("ERROR: pypdf not importable. Use an interpreter satisfying "
          "scripts/ingestion/requirements.txt. Do not install dependencies "
          "without authorization.", file=sys.stderr)
    sys.exit(3)

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MANIFEST_PATH = os.path.join(REPO, "data", "source-manifest", "SOURCE_MANIFEST.jsonl")
OUT_DIR = os.path.join(REPO, "data", "ingestion-expanded")
TEXT_DIR = os.path.join(OUT_DIR, "extracted-text")
MD_DIR = os.path.join(OUT_DIR, "structured-markdown")

PIPELINE_VERSION = "phase-c-expansion-1.0"
SHORT_PAGE_CHARS = 50
LARGE_CHUNK_CHARS = 12000

STAGED_DCS_CHAPTERS = ("Ch09_Child_Records", "Ch14_CPS", "Ch16A_Foster_Care",
                       "Ch16B_Foster_Homes", "Ch31_Field_Services")
EXPANSION_FAMILIES = ("tca_title_36", "tca_title_37",
                      "tenn_rules_juvenile_practice_procedure",
                      "tenn_rules_evidence")

DESIGNATION = {
    "tca_title_36": "core_v1_candidate",
    "tca_title_37": "core_v1_candidate",
    "tenn_rules_juvenile_practice_procedure": "core_v1_candidate",
    "tenn_rules_evidence": "evidence_guardrail_and_limited_answer_candidate",
    "dcs_policies_procedures": "staged_dcs_candidate",
}
TRE_ANSWER_SCOPE_NOTE = (
    "Tenn. R. Evid. is guardrail/reference authority for judicial-use "
    "constraints and evidentiary procedure; it is answer authority ONLY when "
    "the question concerns evidentiary rules, admissibility, objections, "
    "offers of proof, expert proof, hearsay, judicial notice, or related "
    "procedural/evidentiary issues. Keep TRE labeled separately from Title "
    "36, Title 37, TRJPP, and DCS policy authority."
)
RESTRICTED_TYPES = {"annotation_candidate", "case_note_candidate", "advisory_comment"}

# ---------------------------------------------------------------- warnings

WARNINGS: list[dict] = []


def warn(source_path, code, detail, page=None, chunk_id=None):
    WARNINGS.append({"source_path": source_path, "code": code, "detail": detail,
                     "page": page, "chunk_id": chunk_id})


# ---------------------------------------------------------------- utilities

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
    return re.sub(r"[^A-Za-z0-9._-]+", "_", s).strip("_")


def garbled_score(text: str) -> float:
    if not text:
        return 0.0
    bad = text.count("�") + len(re.findall(r"\(cid:\d+\)", text))
    return bad / max(1, len(text))


# ------------------------------------------------------------- extraction

def extract_pages(path, source_path):
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
                 f"{len(text.strip())} chars on page {i}", page=i)
        g = garbled_score(text)
        if g > 0.001:
            warn(source_path, "garbled_text_suspected", f"ratio {g:.4f} page {i}", page=i)
        pages.append((i, text))
    return pages


# ------------------------------------------- Lexis segmentation (statutes/rules)

LEXIS_BLOCK_MARKERS = {
    "History": "history",
    "Commentary": "advisory_comment",
    "Advisory Commission Comments": "advisory_comment",
    "Advisory Commission Comments.": "advisory_comment",
    "Advisory Commission Comment.": "advisory_comment",
    "COMMENTS TO OFFICIAL TEXT": "advisory_comment",
    "Annotations": "annotation_candidate",
    "Notes": "annotation_candidate",
    "Opinion Notes": "annotation_candidate",
    "ATTORNEY GENERAL OPINIONS": "annotation_candidate",
    "Research References & Practice Aids": "annotation_candidate",
    "Research References": "annotation_candidate",
    "NOTES TO DECISIONS": "case_note_candidate",
    "Notes To Decisions": "case_note_candidate",
    "Case Notes": "case_note_candidate",
    "Decisions Under Prior Law": "case_note_candidate",
    "End of Document": None,
}
# "Notes" is only a block marker when it follows the Annotations container;
# treat it as a marker only when current block is already annotation-side.
NOTES_CONTEXT_TYPES = {"annotation_candidate", "case_note_candidate"}

LEXIS_RUNNING_LINES = {
    "TENNESSEE CODE ANNOTATED",
    "TENNESSEE COURT RULES ANNOTATED",
}
PAGE_HEADER_RE = re.compile(r"^\s*Page \d+ of \d+\s*$")
STUB_TEXTS = set(LEXIS_BLOCK_MARKERS) | {"Index", ""}

CASE_NOTE_HEAD_RE = re.compile(r"^\s{0,4}\d{1,3}\.(?:\d{1,2}\.?)?\s+[A-Z\"'(][^\n]{1,78}$")

# Lexis publishes amended sections as paired versions, e.g.
# "[Effective until July 1, 2026. See the version effective on July 1, 2026.]".
# Current and future-effective text must NEVER be silently blended; flag every
# chunk containing such a banner so Phase D can version-partition them.
VERSION_NOTE_RE = re.compile(
    r"\[\s*(?:Effective|Contingent)[^\]]{0,160}?\]", re.S)


def split_lexis_units(pages, unit_start_re, source_path):
    units, current = [], None
    for pno, text in pages:
        lines = [ln.rstrip() for ln in text.split("\n")]
        first = next((ln.strip() for ln in lines if ln.strip()), "")
        if unit_start_re.match(first):
            current = {"start_page": pno, "lines": []}
            units.append(current)
        elif current is None:
            warn(source_path, "preamble_before_first_unit",
                 "page precedes first unit header; kept as unknown unit", page=pno)
            current = {"start_page": pno, "lines": [], "preamble": True}
            units.append(current)
        current["lines"].extend((pno, ln) for ln in lines)
    return units


def parse_lexis_unit(unit, source_path, heading_re):
    lines = unit["lines"]
    n, i = len(lines), 0
    while i < n and not lines[i][1].strip():
        i += 1
    citation_line = lines[i][1].strip() if i < n else ""
    i += 1
    if i < n and lines[i][1].strip().startswith("Current "):
        i += 1
    hier = []
    if i < n and lines[i][1].strip().startswith("TN - "):
        hier.append(lines[i][1].strip())
        i += 1
        while i < n and lines[i][1].strip() and not heading_re.match(lines[i][1].strip()):
            hier.append(lines[i][1].strip())
            i += 1
    hierarchy_path = [p.strip() for p in " ".join(hier).split(">")] if hier else []
    heading = ""
    while i < n and not lines[i][1].strip():
        i += 1
    if i < n and heading_re.match(lines[i][1].strip()):
        heading = lines[i][1].strip()
        i += 1
        if (heading and not heading.endswith((".", ".]", "]")) and i < n
                and lines[i][1].strip() and not lines[i][1].strip().startswith("(")
                and lines[i][1].strip() not in LEXIS_BLOCK_MARKERS
                and len(lines[i][1].strip()) < 80):
            heading += " " + lines[i][1].strip()
            i += 1
        # absorb a wrapped "[Effective …]" version bracket completely (up to
        # 3 more lines) so version direction is never truncated out of titles
        extra = 0
        while ("[" in heading and "]" not in heading.rsplit("[", 1)[1]
               and i < n and lines[i][1].strip() and extra < 3):
            heading += " " + lines[i][1].strip()
            i += 1
            extra += 1
    else:
        warn(source_path, "missing_section_heading",
             f"no heading after unit header {citation_line!r}", page=unit["start_page"])

    heading_norm = re.sub(r"\s+", " ", heading)
    blocks, cur_type, cur_lines = [], "black_letter_text", []

    def flush():
        nonlocal cur_lines
        if any(ln.strip() for _p, ln in cur_lines):
            blocks.append((cur_type, cur_lines))
        cur_lines = []

    echo_budget = 0   # continuation-page heading echoes can wrap to 2 lines
    for pno, ln in lines[i:]:
        s = ln.strip()
        if PAGE_HEADER_RE.match(s):
            echo_budget = 2
            continue
        if s in LEXIS_RUNNING_LINES:
            continue
        if echo_budget > 0:
            sn = re.sub(r"\s+", " ", s)
            if s and heading_norm and sn in heading_norm:
                echo_budget -= 1
                continue
            echo_budget = 0
        if s in LEXIS_BLOCK_MARKERS:
            if s == "Notes" and cur_type not in NOTES_CONTEXT_TYPES:
                cur_lines.append((pno, ln))   # content word, not the Notes container
                continue
            flush()
            mapped = LEXIS_BLOCK_MARKERS[s]
            cur_type = mapped if mapped else "black_letter_text"
            continue
        cur_lines.append((pno, ln))
    flush()
    return {"citation_line": citation_line, "hierarchy_path": hierarchy_path,
            "heading": heading_norm, "blocks": blocks,
            "start_page": unit["start_page"], "preamble": unit.get("preamble", False)}


def subsplit_case_notes(lines):
    """Split an oversized note compilation at numbered note headings.
    Returns list of (subheading, lines) — or None if not enough structure."""
    heads = [idx for idx, (_p, ln) in enumerate(lines)
             if CASE_NOTE_HEAD_RE.match(ln) and not ln.strip().endswith(",")]
    # require real structure and skip the leading TOC list (consecutive heads)
    if len(heads) < 3:
        return None
    parts, prev_idx, prev_title = [], 0, "index"
    body_heads = []
    for k, idx in enumerate(heads):
        nxt = heads[k + 1] if k + 1 < len(heads) else None
        if nxt is not None and nxt == idx + 1:
            continue          # consecutive heading lines = TOC block, skip
        body_heads.append(idx)
    if len(body_heads) < 3:
        return None
    for idx in body_heads:
        if idx > prev_idx:
            parts.append((prev_title, lines[prev_idx:idx]))
        prev_title = lines[idx][1].strip()
        prev_idx = idx
    parts.append((prev_title, lines[prev_idx:]))
    return [(t, seg) for t, seg in parts if any(ln.strip() for _p, ln in seg)]


# ------------------------------------------------------------- DCS parsing

DCS_BANNER_TYPES = {"POLICY": ("policy", "policy_text"), "PROTOCOL": ("protocol", "protocol"),
                    "GUIDE": ("guide", "guide"), "WORK AID": ("work_aid", "work_aid"),
                    "MANUAL": ("manual", "manual")}
DCS_FILENAME_TYPES = {
    "Protocol": ("protocol", "protocol"), "Guide": ("guide", "guide"),
    "Guidelines": ("guidelines", "guide"), "Manual": ("manual", "manual"),
    "Work": ("work_aid", "work_aid"),       # Work_Aid / Work_Aid_13
    "Tip": ("tip_sheet", "unknown"), "FAQ": ("faq", "unknown"),
    "N": ("n_a", "unknown"), "RDA": ("rda", "unknown"),
    "Form": ("form", "unknown"), "Att": ("attachment", "unknown"),
    "Handbook": ("handbook", "unknown"),
}
DCS_RUNNING_RES = [
    re.compile(r"^\s*Act in the best interest of Tennessee.s children and youth\.?.*$"),
    re.compile(r"^\s*Page \d+ of \d+\s*$"),
    re.compile(r"^\s*RDA\s+SW?-?\d+\s*$"),
]
DCS_SECTION_RE = re.compile(r"^([A-Z])\.\s{1,3}(\S.{0,84})$")
DCS_NAMED_SECTION_RE = re.compile(
    r"^(Glossary|Procedures?|Forms?( and Attachments)?|Policy Statement|Purpose|"
    r"Standards?|Application|Collateral Documents?|Related Policies|Appendix [A-Z0-9]+|"
    r"Section [0-9IVX]+[.:]?.{0,60}|Chapter [0-9IVX]+[.:]?.{0,60})\s*:?\s*$",
    re.IGNORECASE)
DCS_NUM_SECTION_RE = re.compile(r"^(\d{1,2}(\.\d{1,2}){0,2})\s+[A-Z][^\n]{2,80}$")
DCS_DATE_FIELDS = ["Original Effective Date", "Current Effective Date",
                   "Effective Date", "Supersedes", "Last Review Date", "Revision Date"]


def dcs_filename_doc_type(filename):
    m = re.match(r"^\d{3}_(\d{1,2}\.\d{1,2}[A-Za-z]?(?:-DOE)?)_", filename)
    if m:
        return ("policy", "policy_text", m.group(1).replace("-DOE", ""))
    m = re.match(r"^\d{3}_([A-Za-z]+)", filename)
    token = m.group(1) if m else ""
    dt, ct = DCS_FILENAME_TYPES.get(token, ("", ""))
    return (dt, ct, "")


def parse_manifest_notes(notes):
    out = {}
    m = re.search(r"policy number:\s*([^;]+);", notes or "")
    if m:
        out["policy_number_label"] = m.group(1).strip()
    m = re.search(r"name:\s*([^;]+);", notes or "")
    if m:
        out["policy_name"] = m.group(1).strip()
    return out


def parse_dcs(pages, source_path, filename, manifest_notes):
    fn_dt, fn_ct, fn_policy_no = dcs_filename_doc_type(filename)
    first_lines = [ln.strip() for ln in (pages[0][1] if pages else "").split("\n") if ln.strip()]
    banner = first_lines[0].upper() if first_lines else ""
    b_dt, b_ct = DCS_BANNER_TYPES.get(banner, ("", ""))
    document_type = b_dt or fn_dt
    chunk_type = b_ct or fn_ct
    if not document_type:
        document_type, chunk_type = "unknown", "unknown"
        warn(source_path, "dcs_doc_type_undetected",
             f"banner {banner!r} and filename token unmapped", page=1)
    elif not b_dt and fn_dt and fn_ct == "unknown":
        warn(source_path, "dcs_doc_type_unmapped_chunktype",
             f"document_type {fn_dt!r} has no dedicated chunk_type; using 'unknown'", page=1)

    notes_meta = parse_manifest_notes(manifest_notes)
    policy_number = fn_policy_no
    policy_title = ""
    for ln in first_lines[:14]:
        m = re.match(r"^(\d{1,2}\.\d{1,2}[A-Za-z]?(-DOE)?)[ ,:]+(\S.*)$", ln)
        if m:
            policy_number = policy_number or m.group(1).replace("-DOE", "")
            policy_title = m.group(3).strip()
            break
    if not policy_title:
        policy_title = notes_meta.get("policy_name", "")
    if not policy_number and notes_meta.get("policy_number_label", "").replace(".", "").isdigit():
        policy_number = notes_meta["policy_number_label"]
    if document_type == "policy" and not policy_number:
        warn(source_path, "dcs_policy_number_undetected", "numbered policy without number", page=1)

    joined_p1 = re.sub(r"\s+", " ", pages[0][1] if pages else "")
    dates = {}
    for field in DCS_DATE_FIELDS:
        m = re.search(re.escape(field) + r"\s*:\s*([0-9/]{6,10})", joined_p1)
        if m:
            dates[field] = m.group(1)
    if not dates:
        warn(source_path, "dcs_dates_undetected", "no effective/revision dates on page 1", page=1)

    header_lines, body_lines = [], []
    for pno, text in pages:
        for ln in text.split("\n"):
            s = ln.strip()
            if any(p.match(s) for p in DCS_RUNNING_RES):
                continue
            if pno >= 2 and policy_number and s.endswith(policy_number) and len(s) < 110:
                continue
            (header_lines if pno == 1 else body_lines).append((pno, ln.rstrip()))

    split_idx = None
    for idx, (_p, ln) in enumerate(header_lines):
        s = ln.strip()
        if DCS_NAMED_SECTION_RE.match(s) or DCS_SECTION_RE.match(s):
            split_idx = idx
            break
    if split_idx is not None:
        body_lines = header_lines[split_idx:] + body_lines
        header_lines = header_lines[:split_idx]

    sections, cur_title, cur_lines = [], None, []

    def flush():
        if any(ln.strip() for _p, ln in cur_lines):
            sections.append((cur_title, list(cur_lines)))

    for pno, ln in body_lines:
        s = ln.strip()
        if DCS_SECTION_RE.match(s) or DCS_NAMED_SECTION_RE.match(s) or DCS_NUM_SECTION_RE.match(s):
            flush()
            cur_title, cur_lines = s, []
            continue
        cur_lines.append((pno, ln))
    flush()

    if len(sections) <= 1:
        total = sum(len(ln) for _s in sections for _p, ln in _s[1])
        if total > LARGE_CHUNK_CHARS:
            # page-bounded fallback for large unstructured documents
            warn(source_path, "dcs_sections_undetected_page_split",
                 "no internal headings; splitting large document at page boundaries")
            by_page = defaultdict(list)
            for pno, ln in (sections[0][1] if sections else body_lines):
                by_page[pno].append((pno, ln))
            sections = [(f"(page {p})", by_page[p]) for p in sorted(by_page)]
        else:
            warn(source_path, "dcs_sections_undetected",
                 f"{len(sections)} section(s); whole-document chunk emitted")
    return {"document_type": document_type, "chunk_type": chunk_type,
            "policy_number": policy_number, "policy_title": policy_title,
            "dates": dates, "header_lines": header_lines, "sections": sections}


# ------------------------------------------------------------- chunk emit

def block_text(lines):
    text = "\n".join(ln for _p, ln in lines)
    text = re.sub(r"[ \t]+\n", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def page_span(lines):
    ps = [p for p, ln in lines if ln.strip()]
    return (min(ps), max(ps)) if ps else (None, None)


def make_chunk(seq_key, me, **fields):
    fam = me["authority_family"]
    base = {
        "chunk_id": "",
        "source_manifest_sha256": me["sha256"],
        "source_path": me["relative_path"],
        "source_type": me["source_type"],
        "authority_family": fam,
        "corpus_designation": DESIGNATION[fam],
        "approval_status": "pending_extraction_qa",
        "production_display_status": "",
        "canonical_citation": "", "citation_aliases": [],
        "title": "", "chapter": "", "part": "", "section": "", "subsection": "",
        "rule_number": "", "policy_number": "", "policy_chapter": "",
        "document_type": "",
        "chunk_type": "unknown", "page_start": None, "page_end": None,
        "hierarchy_path": [], "text": "", "text_sha256": "",
        "extraction_warnings": [],
        "answer_scope_note": TRE_ANSWER_SCOPE_NOTE if fam == "tenn_rules_evidence" else "",
    }
    base.update(fields)
    base["production_display_status"] = (
        "restricted_pending_license_review"
        if base["chunk_type"] in RESTRICTED_TYPES else "pending_extraction_qa")
    base["text_sha256"] = sha256_bytes(base["text"].encode())
    base["chunk_id"] = "bb-exp-" + sha256_bytes(f"{me['sha256']}:{seq_key}".encode())[:24]
    return base


def emit_block(chunks, me, source_path, seq_key, ctype, lines, sub_label="",
               extra_warnings=None, **fields):
    text = block_text(lines)
    if not text:
        return
    if text in STUB_TEXTS or (len(text) < 8 and not any(c.isdigit() for c in text)):
        warn(source_path, "stub_chunk_suppressed", f"{seq_key}: {text!r}")
        return
    ps, pe = page_span(lines)
    cw = list(extra_warnings or [])
    if len(text) > LARGE_CHUNK_CHARS:
        cw.append(f"unusually_large_chunk:{len(text)}_chars")
    if ctype == "black_letter_text":
        vm = VERSION_NOTE_RE.search(text)
        if vm:
            cw.append("effective_dated_version_text:" +
                      re.sub(r"\s+", " ", vm.group(0))[:90])
    ch = make_chunk(seq_key, me, chunk_type=ctype, page_start=ps, page_end=pe,
                    text=text, extraction_warnings=cw, **fields)
    if sub_label:
        ch["subsection"] = sub_label
    for w in cw:
        warn(source_path, w.split(":")[0], seq_key, page=ps, chunk_id=ch["chunk_id"])
    chunks.append(ch)


def lexis_chunks(parsed_units, me, family, source_path):
    chunks = []
    for u in parsed_units:
        cite = u["citation_line"]
        canonical, aliases = "", []
        section = rule_number = chapter = part = ""
        if family in ("tca_title_36", "tca_title_37"):
            m = re.search(r"§\s*(\d+-\d+-\d+[a-z]?)", cite)
            if m:
                section = m.group(1)
                canonical = f"Tenn. Code Ann. § {section}"
                aliases = [f"T.C.A. § {section}", f"TCA {section}", f"TCA § {section}"]
            for h in u["hierarchy_path"]:
                if h.startswith("Chapter "):
                    chapter = h
                elif h.startswith("Part "):
                    part = h
        elif family == "tenn_rules_juvenile_practice_procedure":
            m = re.search(r"Rule\s+(\d+[A-Za-z]?)", cite)
            if m:
                rule_number = m.group(1)
                canonical = f"Tenn. R. Juv. P. {rule_number}"
                aliases = [f"Tenn. R. Juv. P. Rule {rule_number}", f"TRJPP {rule_number}"]
        elif family == "tenn_rules_evidence":
            m = re.search(r"Rule\s+(\d+\.?\d*[A-Za-z]?)", cite)
            if m:
                rule_number = m.group(1)
                canonical = f"Tenn. R. Evid. {rule_number}"
                aliases = [f"Tenn. R. Evid. Rule {rule_number}", f"TRE {rule_number}"]
            for h in u["hierarchy_path"]:
                if h.upper().startswith("ARTICLE"):
                    chapter = h
        if not canonical and not u.get("preamble"):
            warn(source_path, "citation_undetected",
                 f"no canonical citation from {cite!r}", page=u["start_page"])
        unit_key = canonical or f"unit-p{u['start_page']}"
        version_note = ""
        vm = VERSION_NOTE_RE.search(u["heading"])
        if vm:
            version_note = re.sub(r"\s+", " ", vm.group(0))[:110]
            warn(source_path, "effective_dated_version_unit",
                 f"{unit_key}: {version_note}", page=u["start_page"])
        common = dict(canonical_citation=canonical, citation_aliases=aliases,
                      title=u["heading"], chapter=chapter, part=part,
                      section=section, rule_number=rule_number,
                      hierarchy_path=u["hierarchy_path"])
        unit_warns = ([f"effective_dated_version_unit:{version_note}"]
                      if version_note else [])
        counter = Counter()
        for ctype, lines in u["blocks"]:
            if u.get("preamble"):
                ctype = "unknown"
            counter[ctype] += 1
            text_len = sum(len(ln) for _p, ln in lines)
            if (ctype in ("case_note_candidate", "annotation_candidate")
                    and text_len > LARGE_CHUNK_CHARS):
                parts = subsplit_case_notes(lines)
                if parts:
                    for j, (sub_title, seg) in enumerate(parts, start=1):
                        emit_block(chunks, me, source_path,
                                   f"{unit_key}:{ctype}:{counter[ctype]}:{j}",
                                   ctype, seg, sub_label=sub_title,
                                   extra_warnings=unit_warns, **common)
                    continue
                warn(source_path, "case_note_subsplit_failed",
                     f"{unit_key}: oversized {ctype} lacked numbered headings")
            emit_block(chunks, me, source_path,
                       f"{unit_key}:{ctype}:{counter[ctype]}", ctype, lines,
                       extra_warnings=unit_warns, **common)
    return chunks


def dcs_chunks(parsed, me, source_path):
    chunks = []
    m = re.search(r"TN_DCS_Policies/([^/]+)/", me["relative_path"])
    policy_chapter = m.group(1) if m else ""
    pn = parsed["policy_number"]
    canonical = f"DCS Policy {pn}" if pn else ""
    aliases = [f"DCS {pn}", f"Policy {pn}"] if pn else []
    common = dict(canonical_citation=canonical, citation_aliases=aliases,
                  title=parsed["policy_title"], policy_number=pn,
                  policy_chapter=policy_chapter,
                  document_type=parsed["document_type"],
                  hierarchy_path=[p for p in ["DCS Policies and Procedures", policy_chapter,
                                              f"{pn} {parsed['policy_title']}".strip()] if p])
    key_base = canonical or me["relative_path"]
    if parsed["header_lines"]:
        dates_note = "; ".join(f"{k}: {v}" for k, v in parsed["dates"].items())
        hdr = dict(common)
        emit_block(chunks, me, source_path, f"{key_base}:header", "metadata",
                   parsed["header_lines"]
                   + ([(1, f"[Document dates — {dates_note}]")] if dates_note else []),
                   section="Document header (application/authority/dates)",
                   **{k: v for k, v in hdr.items() if k != "section"})
    for idx, (sec_title, lines) in enumerate(parsed["sections"], start=1):
        emit_block(chunks, me, source_path,
                   f"{key_base}:section:{idx}:{sec_title or 'untitled'}",
                   parsed["chunk_type"], lines, section=sec_title or "", **common)
    return chunks


# ---------------------------------------------------------------- markdown

def write_markdown(slug, me, chunks, extra_meta=None):
    lines = [f"# {me['relative_path']}", "",
             "| | |", "|---|---|",
             f"| Source SHA-256 | `{me['sha256']}` |",
             f"| Authority family | {me['authority_family']} |",
             f"| Corpus designation | {DESIGNATION[me['authority_family']]} |",
             f"| Approval status | pending_extraction_qa |",
             "", "> Phase C expansion output for human review — NOT production-ready, "
             "NOT an approved authority text.", ""]
    if extra_meta:
        lines += [f"- **{k}:** {v}" for k, v in extra_meta.items()] + [""]
    for ch in chunks:
        head = ch["canonical_citation"] or ch["title"] or ch["chunk_id"]
        pages = (f"pp. {ch['page_start']}–{ch['page_end']}" if ch["page_start"] else "pages unknown")
        sub = f" — {ch['subsection']}" if ch["subsection"] else ""
        lines.append(f"## {head} — {ch['chunk_type']}{sub} ({pages})")
        if ch["production_display_status"] == "restricted_pending_license_review":
            lines.append("*restricted_pending_license_review — internal QA only*")
        lines += ["", ch["text"], ""]
    path = os.path.join(MD_DIR, slug + ".md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    return os.path.relpath(path, REPO)


# --------------------------------------------------------------------- main

def main() -> int:
    if not os.path.isfile(MANIFEST_PATH):
        print("ERROR: manifest missing:", MANIFEST_PATH, file=sys.stderr)
        return 3
    entries = [json.loads(l) for l in open(MANIFEST_PATH, encoding="utf-8")]
    generated_at = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

    selected = []
    for e in entries:
        fam, rel = e["authority_family"], e["relative_path"]
        if fam in EXPANSION_FAMILIES:
            selected.append(e)
        elif (fam == "dcs_policies_procedures"
              and any(f"/TN_DCS_Policies/{c}/" in rel for c in STAGED_DCS_CHAPTERS)
              and rel.lower().endswith(".pdf")):
            selected.append(e)
    selected.sort(key=lambda e: e["relative_path"])

    os.makedirs(TEXT_DIR, exist_ok=True)
    os.makedirs(MD_DIR, exist_ok=True)

    # verification (stop-and-ask on any failure)
    failures = []
    for e in selected:
        full = os.path.join(REPO, e["relative_path"])
        ok = os.path.isfile(full)
        match = ok and sha256_file(full) == e["sha256"]
        if not (ok and match):
            failures.append({"relative_path": e["relative_path"],
                             "on_disk": ok, "hash_match": bool(match)})
    with open(os.path.join(OUT_DIR, "EXPANDED_SOURCE_SELECTION.json"), "w") as f:
        json.dump({"generated_at": generated_at, "pipeline_version": PIPELINE_VERSION,
                   "staged_dcs_chapters": STAGED_DCS_CHAPTERS,
                   "selected_count": len(selected),
                   "selected_by_family": dict(Counter(e["authority_family"] for e in selected)),
                   "verification_failures": failures,
                   "selected": [{"relative_path": e["relative_path"], "sha256": e["sha256"],
                                 "authority_family": e["authority_family"]} for e in selected]},
                  f, indent=2)
        f.write("\n")
    if failures:
        print("STOP-AND-ASK: source verification failed:", failures, file=sys.stderr)
        return 2

    # DCS dedup by sha256 (primary = first sorted path)
    dcs = [e for e in selected if e["authority_family"] == "dcs_policies_procedures"]
    by_hash = defaultdict(list)
    for e in dcs:
        by_hash[e["sha256"]].append(e["relative_path"])
    dup_groups = {h: sorted(ps) for h, ps in by_hash.items() if len(ps) > 1}
    skip_paths = {p for ps in dup_groups.values() for p in ps[1:]}
    with open(os.path.join(OUT_DIR, "EXPANDED_DEDUPLICATION_REPORT.json"), "w") as f:
        json.dump({"generated_at": generated_at,
                   "staged_dcs_files": len(dcs),
                   "unique_dcs_documents": len(by_hash),
                   "duplicate_groups": [
                       {"sha256": h, "primary_path": ps[0], "alias_paths": ps[1:]}
                       for h, ps in sorted(dup_groups.items())],
                   "skipped_duplicate_paths": sorted(skip_paths)}, f, indent=2)
        f.write("\n")

    all_chunks, extraction_manifest = [], []
    for e in selected:
        rel, fam = e["relative_path"], e["authority_family"]
        if rel in skip_paths:
            extraction_manifest.append({"relative_path": rel, "sha256": e["sha256"],
                                        "status": "skipped_duplicate_sha256",
                                        "authority_family": fam})
            continue
        full = os.path.join(REPO, rel)
        slug = slugify(os.path.splitext(os.path.basename(rel))[0])
        rec = {"relative_path": rel, "sha256": e["sha256"], "authority_family": fam,
               "extraction_tool": "pypdf", "status": "extracted",
               "page_count": 0, "char_count": 0, "chunk_count": 0,
               "raw_text_output": None, "markdown_output": None}
        try:
            pages = extract_pages(full, rel)
        except Exception as exc:  # noqa: BLE001
            rec["status"] = "extraction_failed"
            rec["error"] = f"{type(exc).__name__}: {exc}"
            warn(rel, "extraction_failed", rec["error"])
            extraction_manifest.append(rec)
            continue
        rec["page_count"] = len(pages)
        rec["char_count"] = sum(len(t) for _p, t in pages)
        if rec["char_count"] < 20 * max(1, len(pages)):
            rec["status"] = "ocr_needed_not_run"
            warn(rel, "ocr_needed", "no/near-no embedded text; OCR not run")
            extraction_manifest.append(rec)
            continue

        txt_path = os.path.join(TEXT_DIR, slug + ".txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            for pno, text in pages:
                f.write(f"\n===== [page {pno}] =====\n{text}\n")
        rec["raw_text_output"] = os.path.relpath(txt_path, REPO)

        extra_meta = None
        if fam in ("tca_title_36", "tca_title_37"):
            units = split_lexis_units(pages, re.compile(r"^Tenn\. Code Ann\. § \d+-\d+-\d+"), rel)
            parsed = [parse_lexis_unit(u, rel, re.compile(r"^\d+-\d+-\d+[a-z]?\.")) for u in units]
            chunks = lexis_chunks(parsed, e, fam, rel)
        elif fam == "tenn_rules_juvenile_practice_procedure":
            units = split_lexis_units(pages, re.compile(r"^Tenn\. R\. Juv\. P\."), rel)
            parsed = [parse_lexis_unit(u, rel, re.compile(r"^Rule \d+[A-Za-z]?\.")) for u in units]
            chunks = lexis_chunks(parsed, e, fam, rel)
        elif fam == "tenn_rules_evidence":
            units = split_lexis_units(pages, re.compile(r"^Tenn\. R\. Evid\."), rel)
            parsed = [parse_lexis_unit(u, rel,
                                       re.compile(r"^(Rule \d+\.?\d*[A-Za-z]?\.|Note\b)")) for u in units]
            chunks = lexis_chunks(parsed, e, fam, rel)
        else:
            parsed = parse_dcs(pages, rel, os.path.basename(rel), e.get("notes", ""))
            chunks = dcs_chunks(parsed, e, rel)
            extra_meta = {"Document type": parsed["document_type"],
                          "Policy number": parsed["policy_number"] or "(none)",
                          **parsed["dates"]}
        if not chunks:
            warn(rel, "no_chunks_emitted", "extracted but produced no chunks")
            rec["status"] = "extracted_no_chunks"
        rec["chunk_count"] = len(chunks)
        if chunks:
            rec["markdown_output"] = write_markdown(slug, e, chunks, extra_meta)
        all_chunks.extend(chunks)
        extraction_manifest.append(rec)

    # cross-chunk QA
    by_text = defaultdict(list)
    for ch in all_chunks:
        by_text[ch["text_sha256"]].append(ch["chunk_id"])
    dup_chunks = {h: ids for h, ids in by_text.items() if len(ids) > 1}
    for h, ids in dup_chunks.items():
        warn("(cross-file)", "duplicate_chunk_text",
             f"{len(ids)} chunks share text {h[:16]}…: {ids[:6]}")

    sizes = sorted(len(c["text"]) for c in all_chunks) or [0]
    summary = {
        "generated_at": generated_at, "pipeline_version": PIPELINE_VERSION,
        "sources_selected": len(selected),
        "sources_extracted": sum(1 for r in extraction_manifest if r["status"] == "extracted"),
        "sources_skipped_duplicate": sum(1 for r in extraction_manifest
                                         if r["status"] == "skipped_duplicate_sha256"),
        "sources_failed_or_ocr": [r["relative_path"] for r in extraction_manifest
                                  if r["status"] in ("extraction_failed", "ocr_needed_not_run",
                                                     "extracted_no_chunks")],
        "total_chunks": len(all_chunks),
        "chunks_by_authority_family": dict(sorted(Counter(
            c["authority_family"] for c in all_chunks).items())),
        "chunks_by_chunk_type": dict(sorted(Counter(
            c["chunk_type"] for c in all_chunks).items())),
        "chunks_by_corpus_designation": dict(sorted(Counter(
            c["corpus_designation"] for c in all_chunks).items())),
        "chunks_by_display_status": dict(sorted(Counter(
            c["production_display_status"] for c in all_chunks).items())),
        "chunk_size_chars": {"min": sizes[0], "median": sizes[len(sizes) // 2], "max": sizes[-1]},
        "chunks_with_warnings": sum(1 for c in all_chunks if c["extraction_warnings"]),
        "duplicate_text_groups": len(dup_chunks),
        "warning_count": len(WARNINGS),
        "warning_counts_by_code": dict(sorted(Counter(w["code"] for w in WARNINGS).items())),
    }
    with open(os.path.join(OUT_DIR, "EXPANDED_AUTHORITY_CHUNKS.jsonl"), "w") as f:
        for ch in all_chunks:
            f.write(json.dumps(ch, ensure_ascii=False) + "\n")
    with open(os.path.join(OUT_DIR, "EXPANDED_EXTRACTION_MANIFEST.json"), "w") as f:
        json.dump({"generated_at": generated_at, "pipeline_version": PIPELINE_VERSION,
                   "extraction_tool_chain": {"selected": "pypdf",
                                             "ocr": "available (ocrmypdf/tesseract) but not needed"},
                   "files": extraction_manifest}, f, indent=2)
        f.write("\n")
    with open(os.path.join(OUT_DIR, "EXPANDED_CHUNK_SUMMARY.json"), "w") as f:
        json.dump(summary, f, indent=2)
        f.write("\n")
    with open(os.path.join(OUT_DIR, "EXPANDED_EXTRACTION_WARNINGS.json"), "w") as f:
        json.dump({"generated_at": generated_at, "warning_count": len(WARNINGS),
                   "warnings": WARNINGS}, f, indent=2)
        f.write("\n")
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
