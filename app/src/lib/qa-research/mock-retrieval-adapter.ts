// Mock binding of LegalRetrievalAdapter over synthetic static fixtures
// (F5-04 / M1). Deterministic: identical inputs always return identical
// envelopes. No network, no database, no external clients, no vector calls. Gate
// semantics: only current + signed-off rows are returned as displayable;
// restricted / pending / unknown-effectivity / future-effective /
// superseded matches surface ONLY as blocked-class counts, never content.

import fixtureData from "./mock-fixtures.json";
import {
  MOCK_ONLY_TARGET,
  type BlockedClassCounts,
  type ChunkResult,
  type GateAttestation,
  type SourceFamily,
} from "./types";
import type {
  AdapterHealth,
  GatedSpan,
  LegalRetrievalAdapter,
} from "./retrieval-adapter";

interface FixtureChunk extends ChunkResult {
  match_terms: string[];
  blocked_class?: string;
}

interface FixtureAlias {
  normalized: string;
  unit_id: string;
  chunk_id: string;
  variants: string[];
}

const CHUNKS = fixtureData.chunks as unknown as FixtureChunk[];
const ALIASES = fixtureData.aliases as FixtureAlias[];
const FIXTURE_MANIFEST_SHA256 = fixtureData.fixture_manifest_sha256 as string;

export interface MockAdapterOptions {
  // Error-injection switches driving the failure-path scenarios
  // (MR-08 adapter throw, ME-05 echo mismatch, MR-09/GG-07 gate
  // violation, MR-05/GG-06 out-of-filter injection).
  failMode?: "throw_on_search" | "throw_on_lookup" | null;
  echoTarget?: string;
  injectGateViolatingRow?: boolean;
  injectOutOfFilterFamilies?: SourceFamily[];
}

function emptyBlockedCounts(): BlockedClassCounts {
  return {
    restricted: 0,
    pending_qa: 0,
    unknown_effectivity: 0,
    future_effective: 0,
    superseded: 0,
  };
}

function isDisplayableAsOf(chunk: FixtureChunk, asOfDate: string): boolean {
  if (chunk.blocked_class) return false;
  if (chunk.version_status !== "current") return false;
  if (chunk.qa_signoff_status !== "signed_off") return false;
  if (chunk.effective_start !== null && chunk.effective_start > asOfDate) {
    return false;
  }
  if (chunk.effective_end !== null && chunk.effective_end < asOfDate) {
    return false;
  }
  return true;
}

function stripFixtureFields(chunk: FixtureChunk): ChunkResult {
  const row: Partial<FixtureChunk> = { ...chunk, rank: null };
  delete row.match_terms;
  delete row.blocked_class;
  return row as ChunkResult;
}

export function createMockRetrievalAdapter(
  options: MockAdapterOptions = {}
): LegalRetrievalAdapter {
  const echo = options.echoTarget ?? MOCK_ONLY_TARGET;

  return {
    async lookupCitationAlias(normalizedAlias, asOfDate) {
      // Alias resolution is effectivity-independent in the fixture set;
      // the as-of date matters only at the chunk-display layer.
      void asOfDate;
      if (options.failMode === "throw_on_lookup") {
        throw new Error("synthetic adapter lookup failure (test failMode)");
      }
      const needle = normalizedAlias.trim().toLowerCase();
      const hit = ALIASES.find(
        (a) =>
          a.normalized.toLowerCase() === needle ||
          a.variants.some((v) => v.toLowerCase() === needle)
      );
      return {
        normalized_alias: normalizedAlias,
        resolved: Boolean(hit),
        authority_unit_id: hit ? hit.unit_id : null,
        authority_chunk_id: hit ? hit.chunk_id : null,
      };
    },

    async searchDisplayableChunks(queryTerms, asOfDate, familyCodes, limit) {
      if (options.failMode === "throw_on_search") {
        throw new Error("synthetic adapter search failure (test failMode)");
      }
      const clamped = Math.max(1, Math.min(limit, 50));
      const terms = queryTerms.map((t) => t.toLowerCase());
      const blocked = emptyBlockedCounts();
      const rows: ChunkResult[] = [];
      let candidates = 0;

      for (const chunk of CHUNKS) {
        const termHit =
          chunk.match_terms.some((t) => terms.includes(t.toLowerCase())) ||
          terms.includes(chunk.normalized_citation.toLowerCase());
        if (!termHit) continue;
        const familyHit = familyCodes.includes(chunk.authority_family);
        if (!familyHit && !options.injectOutOfFilterFamilies?.includes(chunk.authority_family)) {
          continue;
        }
        candidates += 1;
        if (!isDisplayableAsOf(chunk, asOfDate)) {
          const cls = chunk.blocked_class ?? classifyBlocked(chunk, asOfDate);
          if (cls && cls in blocked) {
            blocked[cls as keyof BlockedClassCounts] += 1;
          }
          continue;
        }
        if (rows.length < clamped) {
          rows.push(stripFixtureFields(chunk));
        }
      }

      if (options.injectGateViolatingRow) {
        // A row whose window excludes every plausible as-of date, returned
        // AS IF displayable: simulates an upstream gate defect (GQ-4).
        const violating = CHUNKS.find(
          (c) => c.authority_chunk_id === "SYNCHUNK-37-901"
        );
        if (violating) {
          rows.push({
            ...stripFixtureFields(violating),
            authority_chunk_id: "SYNCHUNK-GATE-VIOLATION",
            effective_start: "2099-01-01",
            effective_end: null,
          });
        }
      }

      return {
        environment_echo: echo,
        rows,
        candidate_count: candidates,
        blocked_class_counts: blocked,
      };
    },

    async deliverSpans(chunkIds) {
      const spans: GatedSpan[] = [];
      for (const id of chunkIds) {
        const chunk = CHUNKS.find((c) => c.authority_chunk_id === id);
        if (chunk && isDisplayableAsOf(chunk, "9999-12-31") === false) {
          // Displayability is re-checked at span delivery; blocked rows
          // never deliver content even if asked for directly.
          if (chunk.blocked_class || chunk.version_status !== "current") {
            continue;
          }
        }
        if (chunk) {
          spans.push({
            authority_chunk_id: id,
            passage: chunk.gated_chunk_passage,
          });
        }
      }
      return spans;
    },

    async getChunkMetadata(chunkId) {
      const chunk = CHUNKS.find((c) => c.authority_chunk_id === chunkId);
      if (!chunk) return null;
      if (chunk.blocked_class || chunk.version_status !== "current") return null;
      // Metadata only: the passage never travels through this method.
      return { ...stripFixtureFields(chunk), gated_chunk_passage: "" };
    },

    attestGates(rows) {
      const attestation: GateAttestation = {
        all_rows_displayable: rows.every(
          (r) => r.version_status === "current" && r.qa_signoff_status === "signed_off"
        ),
        no_restricted_rows: rows.every((r) => r.answer_scope !== "not_answer_authority"),
        no_pending_rows: rows.every((r) => r.qa_signoff_status === "signed_off"),
        scope_filter_applied: true,
      };
      return attestation;
    },

    healthProbe(): AdapterHealth {
      return {
        target: echo,
        binding: "mock",
        fixture_manifest_sha256: FIXTURE_MANIFEST_SHA256,
        chunk_count: CHUNKS.length,
        alias_count: ALIASES.length,
      };
    },
  };
}

function classifyBlocked(chunk: FixtureChunk, asOfDate: string): string | null {
  if (chunk.version_status === "future_effective") return "future_effective";
  if (chunk.version_status === "unknown_effectivity") return "unknown_effectivity";
  if (chunk.version_status === "superseded") return "superseded";
  if (chunk.qa_signoff_status !== "signed_off") return "pending_qa";
  if (chunk.effective_start !== null && chunk.effective_start > asOfDate) {
    return "future_effective";
  }
  return null;
}
