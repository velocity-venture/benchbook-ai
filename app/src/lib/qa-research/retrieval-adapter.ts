// LegalRetrievalAdapter: the ONLY seam through which legal authority can
// reach the QA research path. Method shapes mirror the two security-definer
// RPCs of the legal_authority schema (lookup_citation_alias,
// search_displayable_chunks) plus the span-delivery abstraction. The M1
// factory registry contains exactly one binding: the mock adapter over
// synthetic fixtures. Adding any other member is a stop condition (SC-11);
// a live binding arrives only in F5-05 under the O6+O2+O7 gate chain.

import {
  TargetNotAvailableError,
  type BlockedClassCounts,
  type ChunkResult,
  type GateAttestation,
  type SourceFamily,
} from "./types";
import { createMockRetrievalAdapter } from "./mock-retrieval-adapter";

export const RESULT_LIMIT_CAP = 50;

export interface AliasResolution {
  normalized_alias: string;
  resolved: boolean;
  authority_unit_id: string | null;
  authority_chunk_id: string | null;
}

export interface ChunkSearchResult {
  environment_echo: string;
  rows: ChunkResult[];
  candidate_count: number;
  blocked_class_counts: BlockedClassCounts;
}

export interface GatedSpan {
  authority_chunk_id: string;
  passage: string;
}

export interface AdapterHealth {
  target: string;
  binding: "mock";
  fixture_manifest_sha256: string;
  chunk_count: number;
  alias_count: number;
}

export interface LegalRetrievalAdapter {
  lookupCitationAlias(
    normalizedAlias: string,
    asOfDate: string
  ): Promise<AliasResolution>;
  searchDisplayableChunks(
    queryTerms: string[],
    asOfDate: string,
    familyCodes: SourceFamily[],
    limit: number
  ): Promise<ChunkSearchResult>;
  deliverSpans(chunkIds: string[]): Promise<GatedSpan[]>;
  // Metadata-only row lookup for resolved-but-not-retrieved citation
  // claims (MC-02). Never returns passage content: the M-2 demotion
  // policy forbids mid-answer span fetches in M1.
  getChunkMetadata(chunkId: string): Promise<ChunkResult | null>;
  attestGates(rows: ChunkResult[]): GateAttestation;
  healthProbe(): AdapterHealth;
}

type AdapterFactory = () => LegalRetrievalAdapter;

// M1 registry: exactly one binding. No preview member, no production
// member. This object is scanned by the static-safety test suite.
const M1_ADAPTER_REGISTRY: Record<"mock_only", AdapterFactory> = {
  mock_only: () => createMockRetrievalAdapter(),
};

export function createRetrievalAdapter(target: string): LegalRetrievalAdapter {
  const factory = M1_ADAPTER_REGISTRY[target as "mock_only"];
  if (!factory) {
    throw new TargetNotAvailableError(target);
  }
  return factory();
}
