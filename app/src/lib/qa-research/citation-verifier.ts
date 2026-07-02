// Citation verification for the mock-only QA research path (F5-04 / M1).
// Every citation-shaped claim in a generation is classified into the
// contract's four levels. Canonical citation strings render ONLY from
// fixture rows, never from model text. Fail-closed rules: a non-refusal
// answer with zero verified citations converts to a refusal; an
// out-of-universe claim suppresses the answer. Per owner decision M-2,
// verified_resolved DEMOTES in M1 (no mid-answer span fetch) and renders
// a distinct "resolved" badge, never the full verified badge.

import type {
  ChunkResult,
  CitationObject,
  CitationVerificationLevel,
} from "./types";
import type { LegalRetrievalAdapter } from "./retrieval-adapter";

// Synthetic-corpus citation claims: TCA-like SYN sections (optionally
// with subsection suffixes finer than fixture resolution), synthetic
// rule citations (TRJPP/TRE), and synthetic DCS policy citations.
const SYN_CLAIM_PATTERN = /\bSYN-(\d{2})-(\d{3,4})((?:\([a-z0-9]+\))*)/gi;
const SYN_RULE_CLAIM_PATTERN = /\b(TRJPP|TRE)\s+SYN-Rule\s+(\d{3,4})\b/gi;
const SYN_POLICY_CLAIM_PATTERN = /\bDCS\s+SYN-Policy\s+(\d{1,2})\.(\d{2})\b/gi;

const RULE_FAMILY_PREFIX: Record<string, string> = {
  TRJPP: "SYN-RJ",
  TRE: "SYN-RE",
};

// Excluded-title citation shapes: out_of_universe at any position.
const EXCLUDED_TITLE_CLAIM_PATTERN =
  /\b(?:39|40|55)-\d{1,3}-\d{1,4}\b|\btitle\s*(?:39|40|55)\b/i;

export interface CitationClaim {
  raw: string;
  normalized: string;
  subsection: string;
}

export function extractCitationClaims(text: string): CitationClaim[] {
  const claims = new Map<string, CitationClaim>();
  const add = (raw: string, normalized: string, subsection: string) => {
    const key = `${normalized}${subsection}`;
    if (!claims.has(key)) {
      claims.set(key, { raw, normalized, subsection });
    }
  };
  for (const match of text.matchAll(SYN_CLAIM_PATTERN)) {
    add(match[0], `SYN-${match[1]}-${match[2]}`.toUpperCase(), match[3] ?? "");
  }
  for (const match of text.matchAll(SYN_RULE_CLAIM_PATTERN)) {
    const prefix = RULE_FAMILY_PREFIX[match[1].toUpperCase()];
    add(match[0], `${prefix}-${match[2]}`, "");
  }
  for (const match of text.matchAll(SYN_POLICY_CLAIM_PATTERN)) {
    add(match[0], `SYN-DC-${match[1]}${match[2]}`, "");
  }
  return Array.from(claims.values());
}

export function hasOutOfUniverseClaim(text: string): boolean {
  return EXCLUDED_TITLE_CLAIM_PATTERN.test(text);
}

export function scopeTagFor(row: ChunkResult): CitationObject["scope_tag"] {
  if (row.answer_scope === "limited_evidentiary_procedural") return "evidentiary";
  if (row.answer_scope === "guardrail_reference_only") return "reference_only";
  return "general";
}

export function buildCitationObject(input: {
  row: ChunkResult;
  level: CitationVerificationLevel;
  asOfDate: string;
  environmentTier: string;
  granularityClamped: boolean;
}): CitationObject {
  const { row } = input;
  return {
    source_family: row.authority_family,
    authority_unit_id: row.authority_unit_id,
    authority_version_id: row.authority_version_id,
    authority_chunk_id: row.authority_chunk_id,
    // Display never exceeds database resolution: the clamped case renders
    // the parent section's canonical citation with its page span.
    canonical_citation: row.canonical_citation,
    normalized_citation: row.normalized_citation,
    source_file_sha256: row.source_file_sha256,
    source_path_label: row.source_path_label,
    page_start: row.page_start,
    page_end: row.page_end,
    display_status: "internal_qa_only",
    answer_scope: row.answer_scope,
    effectivity: {
      version_status: row.version_status,
      effective_label: row.effective_start
        ? `effective ${row.effective_start}${row.effective_end ? ` through ${row.effective_end}` : ", current"}`
        : "effectivity window on file",
      as_of_date_used: input.asOfDate,
    },
    qa_signoff_status: row.qa_signoff_status,
    verification: {
      level: input.level,
      exists_in_corpus: input.level !== "unresolved" && input.level !== "out_of_universe",
      current_as_of_date: row.version_status === "current",
      display_allowed:
        input.level === "verified_retrieved" || input.level === "verified_resolved",
      proposition_supported: input.level === "verified_retrieved" ? true : null,
    },
    environment_tier: input.environmentTier,
    scope_tag: scopeTagFor(row),
    granularity_clamped: input.granularityClamped,
  };
}

export interface VerificationOutcome {
  citations: CitationObject[];
  warnings: Array<{ claim: string; level: "unresolved" }>;
  outOfUniverse: boolean;
  verifiedRetrievedCount: number;
  verifiedResolvedCount: number;
  unresolvedCount: number;
}

// Row lookup by normalized citation for resolved-but-not-retrieved claims
// (MC-02): metadata comes from the corpus row the alias resolves to; the
// passage is NOT fetched (M-2 demotion, metadata-only adapter method).
async function resolveClaimRow(
  normalized: string,
  adapter: LegalRetrievalAdapter,
  asOfDate: string,
  allRows: ChunkResult[]
): Promise<ChunkResult | null> {
  const resolution = await adapter.lookupCitationAlias(normalized, asOfDate);
  if (!resolution.resolved || !resolution.authority_chunk_id) return null;
  const known = allRows.find(
    (r) => r.authority_chunk_id === resolution.authority_chunk_id
  );
  if (known) return known;
  return adapter.getChunkMetadata(resolution.authority_chunk_id);
}

export async function verifyGeneration(input: {
  answerText: string;
  answerSupport: ChunkResult[];
  knownRows: ChunkResult[];
  adapter: LegalRetrievalAdapter;
  asOfDate: string;
  environmentTier: string;
}): Promise<VerificationOutcome> {
  const outcome: VerificationOutcome = {
    citations: [],
    warnings: [],
    outOfUniverse: hasOutOfUniverseClaim(input.answerText),
    verifiedRetrievedCount: 0,
    verifiedResolvedCount: 0,
    unresolvedCount: 0,
  };

  const claims = extractCitationClaims(input.answerText);
  const seenChunks = new Set<string>();

  for (const claim of claims) {
    const retrieved = input.answerSupport.find(
      (r) => r.normalized_citation.toUpperCase() === claim.normalized
    );
    if (retrieved) {
      if (seenChunks.has(retrieved.authority_chunk_id)) continue;
      seenChunks.add(retrieved.authority_chunk_id);
      outcome.citations.push(
        buildCitationObject({
          row: retrieved,
          level: "verified_retrieved",
          asOfDate: input.asOfDate,
          environmentTier: input.environmentTier,
          granularityClamped: claim.subsection.length > 0,
        })
      );
      outcome.verifiedRetrievedCount += 1;
      continue;
    }

    const resolvedRow = await resolveClaimRow(
      claim.normalized,
      input.adapter,
      input.asOfDate,
      input.knownRows
    );
    if (resolvedRow) {
      if (seenChunks.has(resolvedRow.authority_chunk_id)) continue;
      seenChunks.add(resolvedRow.authority_chunk_id);
      outcome.citations.push(
        buildCitationObject({
          row: resolvedRow,
          level: "verified_resolved",
          asOfDate: input.asOfDate,
          environmentTier: input.environmentTier,
          granularityClamped: claim.subsection.length > 0,
        })
      );
      outcome.verifiedResolvedCount += 1;
      continue;
    }

    outcome.warnings.push({ claim: claim.raw, level: "unresolved" });
    outcome.unresolvedCount += 1;
  }

  return outcome;
}

export function confidenceFor(outcome: VerificationOutcome): "HIGH" | "MEDIUM" | "LOW" {
  if (outcome.verifiedRetrievedCount === 0 && outcome.verifiedResolvedCount === 0) {
    return "LOW";
  }
  if (outcome.verifiedResolvedCount > 0 || outcome.unresolvedCount > 0) {
    return "MEDIUM";
  }
  return "HIGH";
}
