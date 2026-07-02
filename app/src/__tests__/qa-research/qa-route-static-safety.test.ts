// T8 (F5-04 / M1): static source-scan assertions over the qa-research
// module graph plus contract-shape drift checks. These are the negative-
// space guarantees: what must NOT exist anywhere in the mock path.
// Forbidden strings are assembled by concatenation so this file never
// contains the literal trigger tokens repo-wide guardrail greps look for.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { buildRefusalObject } from "../../lib/qa-research/refusals";
import { buildCitationObject } from "../../lib/qa-research/citation-verifier";
import fixtures from "../../lib/qa-research/mock-fixtures.json";
import type { ChunkResult } from "../../lib/qa-research/types";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(HERE, "../..");
const REPO_ROOT = resolve(HERE, "../../../..");

const SCANNED_DIRS = [
  resolve(APP_SRC, "lib/qa-research"),
  resolve(APP_SRC, "app/api/qa-research"),
  resolve(APP_SRC, "app/(dashboard)/qa-research"),
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function graphSources(): Array<{ path: string; text: string }> {
  return SCANNED_DIRS.flatMap((dir) =>
    walk(dir).map((path) => ({ path, text: readFileSync(path, "utf-8") }))
  );
}

// Spliced forbidden tokens (concatenation prevents self-matching).
const FORBIDDEN_EVERYWHERE: Array<{ name: string; needle: string }> = [
  { name: "scoped external db client import", needle: "@sup" + "abase" },
  { name: "db client factory call", needle: "create" + "Client" },
  { name: "platform db env prefix", needle: "SUPA" + "BASE" },
  { name: "database url env var", needle: "DATABASE" + "_URL" },
  { name: "long db url scheme", needle: "postgres" + "ql://" },
  { name: "short db url scheme", needle: "postgres" + "://" },
  { name: "elevated-role key naming", needle: "service" + "_role" },
  { name: "vector api call", needle: "embed" + "ding" },
  { name: "http client library", needle: "ax" + "ios" },
  { name: "other-provider client", needle: "open" + "ai" },
  { name: "live model sdk import", needle: "@anthropic" + "-ai/sdk" },
  { name: "external http fetch (double quote)", needle: 'fetch("' + "http" },
  { name: "external http fetch (single quote)", needle: "fetch('" + "http" },
  { name: "external search phrase", needle: "web " + "search" },
  { name: "flat corpus json", needle: "legal-corpus" + "-data" },
  { name: "flat tca data module", needle: "tca-" + "data" },
  { name: "flat trjpp data module", needle: "trjpp-" + "data" },
  { name: "flat dcs data module", needle: "dcs-" + "data" },
  { name: "legacy corpus loader", needle: "loadRelevant" + "Corpus" },
];

describe("static safety: forbidden strings absent from the qa-research graph", () => {
  const sources = graphSources();

  it("scans a non-empty module graph including route and page", () => {
    expect(sources.length).toBeGreaterThanOrEqual(17);
    expect(sources.some((s) => s.path.includes("api/qa-research"))).toBe(true);
    expect(sources.some((s) => s.path.includes("(dashboard)/qa-research"))).toBe(true);
  });

  for (const { name, needle } of FORBIDDEN_EVERYWHERE) {
    it(`contains no ${name}`, () => {
      const hits = sources
        .filter((s) => s.text.toLowerCase().includes(needle.toLowerCase()))
        .map((s) => s.path);
      expect(hits).toEqual([]);
    });
  }

  it("excluded-title tokens appear only in guardrail pattern/verifier/scope contexts", () => {
    // Titles 39/40/55 may appear ONLY as refusal detection patterns,
    // never as fixture authorities.
    const fixtureText = JSON.stringify(fixtures);
    expect(/"authority_family"\s*:\s*"tca_title_(39|40|55)"/.test(fixtureText)).toBe(false);
    expect(/\b(39|40|55)-\d{1,3}-\d{1,4}\b/.test(fixtureText)).toBe(false);
  });

  it("every fixture record is synthetic with a SYNTHETIC citation marker", () => {
    const chunks = fixtures.chunks as Array<{
      synthetic: boolean;
      canonical_citation: string;
      gated_chunk_passage: string;
    }>;
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      expect(chunk.synthetic).toBe(true);
      expect(chunk.canonical_citation).toContain("SYNTHETIC");
      expect(chunk.gated_chunk_passage).toContain("SYNTHETIC");
      expect(chunk.gated_chunk_passage.length).toBeLessThanOrEqual(200);
    }
  });
});

describe("contract-shape drift (builders vs F5-02 contract JSONs)", () => {
  const contractsDir = resolve(
    REPO_ROOT,
    "docs/fable5-app-integration-readiness/contracts"
  );

  function requiredFields(contractFile: string): string[] {
    const doc = JSON.parse(
      readFileSync(resolve(contractsDir, contractFile), "utf-8")
    );
    return doc.required_fields as string[];
  }

  it("refusal objects carry every required contract field", () => {
    const refusal = buildRefusalObject({
      refusalId: "SYNRFID-CONTRACT",
      kind: "out_of_scope",
      variant: "excluded_title",
      stage: "pre_retrieval",
      environmentTarget: "mock_only",
    });
    for (const field of requiredFields("refusal_object_contract.json")) {
      expect(refusal, `refusal field ${field}`).toHaveProperty(field);
    }
  });

  it("citation objects carry every required contract field", () => {
    const row = (fixtures.chunks as unknown as ChunkResult[])[0];
    const citation = buildCitationObject({
      row,
      level: "verified_retrieved",
      asOfDate: "2026-07-02",
      environmentTier: "mock",
      granularityClamped: false,
    });
    for (const field of requiredFields("citation_object_contract.json")) {
      expect(citation, `citation field ${field}`).toHaveProperty(field);
    }
  });

  it("refusal kinds match the refusal_records schema enum exactly", () => {
    const doc = JSON.parse(
      readFileSync(resolve(contractsDir, "refusal_object_contract.json"), "utf-8")
    );
    const contractKinds: string[] = doc.field_rules.refusal_kind.enum;
    expect(contractKinds).toEqual([
      "out_of_scope",
      "no_authority_support",
      "future_effective_only",
      "restricted_display_only",
      "unsupported_answer",
      "safety_guardrail",
    ]);
  });
});
