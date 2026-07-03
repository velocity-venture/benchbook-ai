// Prompt contract for the mock-only QA research path (F5-04 / M1).
// The system prompt confines generation to the retrieved synthetic spans:
// role boundary, corpus-only rule, refusal hooks, TRE/DCS scope clauses,
// and the as-of statement. SYSTEM_PROMPT_VERSION is recorded in every
// answer audit entry so prompt drift is auditable (risk R8).
// Also home to the edge-safe sha256 helper used for all audit hashes.

import type { ChunkResult } from "./types";
import type { GatedSpan } from "./retrieval-adapter";

export const SYSTEM_PROMPT_VERSION = "qa-route-prompt-contract-v1";

// Pinned contract elements; the R8 prompt-pin test asserts each of these
// appears verbatim in the assembled system prompt.
export const PROMPT_CONTRACT_ELEMENTS = [
  "You are a closed-universe research assistant for Tennessee juvenile and family court reference work.",
  "Answer ONLY from the retrieved passages supplied below. Never answer from memory, general legal knowledge, the web, or any other source.",
  "If the retrieved passages do not support an answer, respond exactly with: NO_SUPPORTED_ANSWER",
  "Never recommend a ruling, disposition, or outcome; never evaluate witness or party credibility; never supply facts outside the record.",
  "Tennessee Rules of Evidence material is limited to evidentiary and procedural scope.",
  "DCS policy material is reference-only and is never controlling legal authority.",
  "Cite every proposition using the canonical citation strings of the supplied passages, unchanged.",
] as const;

export interface PromptPackage {
  system: string;
  user: string;
  prompt_package_hash: string;
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildPromptPackage(input: {
  query: string;
  asOfDate: string;
  answerSupport: ChunkResult[];
  spans: GatedSpan[];
}): Promise<PromptPackage> {
  const spanByChunk = new Map(input.spans.map((s) => [s.authority_chunk_id, s.passage]));
  const passageBlock = input.answerSupport
    .map((row, i) => {
      const passage = spanByChunk.get(row.authority_chunk_id) ?? "";
      return [
        `[PASSAGE ${i + 1}]`,
        `citation: ${row.canonical_citation}`,
        `family: ${row.authority_family}`,
        `scope: ${row.answer_scope}`,
        `passage: ${passage}`,
      ].join("\n");
    })
    .join("\n\n");

  const system = [
    ...PROMPT_CONTRACT_ELEMENTS,
    `All research is as of ${input.asOfDate}; do not present material effective after that date.`,
    "",
    "Retrieved passages (synthetic mock corpus):",
    passageBlock,
  ].join("\n");

  const user = input.query;
  const prompt_package_hash = await sha256Hex(
    `${SYSTEM_PROMPT_VERSION}\n${system}\n${user}`
  );

  return { system, user, prompt_package_hash };
}
