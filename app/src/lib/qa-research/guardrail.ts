// Judicial guardrail pipeline for the mock-only QA research path
// (F5-04 / M1): GP-* pre-retrieval, GQ-* post-retrieval, GA-* post-
// generation. Pattern data lives in guardrail-patterns.json so pattern
// changes are reviewable data diffs. Excluded-title/topic detection
// (GP-3) reuses the existing scope-guard unmodified. Every stage fails
// closed: a classifier error becomes a refusal, never a pass-through.

import { detectOutOfScopeQuery } from "../scope-guard";
import patternData from "./guardrail-patterns.json";
import type {
  AnswerScopeIntent,
  ChunkResult,
  GuardrailCheckRun,
  GuardrailDecision,
  QueryClassification,
  RefusalKind,
} from "./types";

interface PatternClass {
  check_id: string;
  class: string;
  refusal_kind: string;
  refusal_variant: string;
  patterns: string[];
}

interface CompiledClass {
  checkId: GuardrailCheckRun["id"];
  className: string;
  refusalKind: RefusalKind;
  refusalVariant: string;
  regexes: RegExp[];
}

function compileClasses(classes: PatternClass[]): CompiledClass[] {
  return classes.map((c) => ({
    checkId: c.check_id as GuardrailCheckRun["id"],
    className: c.class,
    refusalKind: c.refusal_kind as RefusalKind,
    refusalVariant: c.refusal_variant,
    regexes: c.patterns.map((p) => new RegExp(p, "i")),
  }));
}

const PRE_CLASSES = compileClasses(patternData.classes as PatternClass[]);
const GEN_CLASSES = compileClasses(
  (patternData.generation_scan_classes as Array<
    Omit<PatternClass, "refusal_kind" | "refusal_variant">
  >).map((c) => ({
    ...c,
    refusal_kind: "safety_guardrail",
    refusal_variant: c.class,
  }))
);

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

// Citation-shaped detection for the synthetic corpus plus intent cues.
const SYNTHETIC_CITATION_PATTERN = /\bSYN-\d{2}-\d{3,4}\b/gi;
const EVIDENTIARY_INTENT_PATTERN =
  /\b(hearsay|admissib\w*|evidence rule|rules? of evidence|authenticat\w*|objection|foundation|impeach\w*|privilege)\b/i;
const DCS_REFERENCE_INTENT_PATTERN =
  /\b(dcs|department of children'?s services)\b.*\b(polic|procedur|checklist|practice)\w*|\b(polic|procedur)\w*\b.*\b(dcs|department of children'?s services)\b/i;

export function classifyQuery(query: string): QueryClassification & {
  detected_citations: string[];
} {
  const citations = Array.from(
    new Set(
      Array.from(query.matchAll(SYNTHETIC_CITATION_PATTERN)).map((m) =>
        m[0].toUpperCase()
      )
    )
  );
  let intent: AnswerScopeIntent = "general_answer";
  if (EVIDENTIARY_INTENT_PATTERN.test(query)) {
    intent = "evidentiary_procedural";
  } else if (DCS_REFERENCE_INTENT_PATTERN.test(query)) {
    intent = "reference_only";
  }
  return {
    guardrail_decision: "proceed",
    answer_scope_intent: intent,
    detected_citation_count: citations.length,
    detected_citations: citations,
  };
}

export interface GuardrailServiceOptions {
  // Test hook driving the GG-12 fail-closed scenario: makes the
  // pre-retrieval classifier throw as if a check crashed.
  failMode?: "throw_pre" | null;
}

export interface PreRetrievalResult {
  decision: GuardrailDecision;
  classification: (QueryClassification & { detected_citations: string[] }) | null;
}

export interface PostRetrievalResult {
  decision: GuardrailDecision;
  answerSupport: ChunkResult[];
  referenceMaterial: ChunkResult[];
}

export interface GenerationScanResult {
  decision: GuardrailDecision;
}

export interface GuardrailService {
  preRetrieval(query: string, window: ConversationTurn[]): PreRetrievalResult;
  postRetrieval(
    rows: ChunkResult[],
    intent: AnswerScopeIntent,
    familyFilter: string[],
    asOfDate: string
  ): PostRetrievalResult;
  scanGeneration(answerText: string): GenerationScanResult;
}

function refuseDecision(
  stage: GuardrailDecision["stage"],
  checksRun: GuardrailCheckRun[],
  kind: RefusalKind,
  variant: string
): GuardrailDecision {
  return {
    decision: "refuse",
    stage,
    checks_run: checksRun,
    classification: null,
    timing_ms: 0,
    refusal_kind: kind,
    refusal_variant: variant,
  };
}

export function createGuardrailService(
  options: GuardrailServiceOptions = {}
): GuardrailService {
  return {
    preRetrieval(query, window) {
      const checksRun: GuardrailCheckRun[] = [];
      try {
        if (options.failMode === "throw_pre") {
          throw new Error("synthetic classifier failure (test failMode)");
        }

        // GP-3: excluded titles/topics over the current query AND every
        // prior turn of the assembled window (GG-02: an excluded-title
        // reference earlier in the window still refuses).
        const windowTexts = [query, ...window.map((t) => t.content)];
        for (const text of windowTexts) {
          const scope = detectOutOfScopeQuery(text);
          if (scope) {
            checksRun.push({ id: "GP-3", outcome: "fail" });
            return {
              decision: refuseDecision(
                "pre_retrieval",
                checksRun,
                "out_of_scope",
                "excluded_title"
              ),
              classification: null,
            };
          }
        }
        checksRun.push({ id: "GP-3", outcome: "pass" });

        // GP-4..GP-9 pattern classes over the current query and window.
        for (const cls of PRE_CLASSES) {
          const tripped = windowTexts.some((text) =>
            cls.regexes.some((r) => r.test(text))
          );
          if (tripped) {
            checksRun.push({ id: cls.checkId, outcome: "fail" });
            return {
              decision: refuseDecision(
                "pre_retrieval",
                checksRun,
                cls.refusalKind,
                cls.refusalVariant
              ),
              classification: null,
            };
          }
          checksRun.push({ id: cls.checkId, outcome: "pass" });
        }

        const classification = classifyQuery(query);
        return {
          decision: {
            decision: "proceed",
            stage: "pre_retrieval",
            checks_run: checksRun,
            classification,
            timing_ms: 0,
          },
          classification,
        };
      } catch {
        // Fail closed (GG-12): classifier errors refuse; they never
        // proceed and never bypass later gates.
        checksRun.push({ id: "GP-8", outcome: "error" });
        return {
          decision: refuseDecision(
            "pre_retrieval",
            checksRun,
            "safety_guardrail",
            "classifier_error"
          ),
          classification: null,
        };
      }
    },

    postRetrieval(rows, intent, familyFilter, asOfDate) {
      const checksRun: GuardrailCheckRun[] = [];
      const drops: NonNullable<GuardrailDecision["drops"]> = [];

      // GQ-4: as-of conformity. A row whose effectivity window excludes
      // the as-of date indicates a gate defect upstream; refuse with a
      // defect alert rather than degrade (MR-09 / GG-07).
      for (const row of rows) {
        const startsAfter =
          row.effective_start !== null && row.effective_start > asOfDate;
        const endedBefore =
          row.effective_end !== null && row.effective_end < asOfDate;
        if (row.version_status === "current" && (startsAfter || endedBefore)) {
          checksRun.push({ id: "GQ-4", outcome: "fail" });
          return {
            decision: {
              ...refuseDecision(
                "retrieval",
                checksRun,
                "no_authority_support",
                "internal_gate_error"
              ),
              defect_alert: true,
            },
            answerSupport: [],
            referenceMaterial: [],
          };
        }
      }
      checksRun.push({ id: "GQ-4", outcome: "pass" });

      // GQ-1: displayability attestation over returned rows.
      const nonDisplayable = rows.filter(
        (r) => r.version_status !== "current" || r.qa_signoff_status !== "signed_off"
      );
      if (nonDisplayable.length > 0) {
        checksRun.push({ id: "GQ-1", outcome: "fail" });
        return {
          decision: {
            ...refuseDecision(
              "retrieval",
              checksRun,
              "no_authority_support",
              "internal_gate_error"
            ),
            defect_alert: true,
          },
          answerSupport: [],
          referenceMaterial: [],
        };
      }
      checksRun.push({ id: "GQ-1", outcome: "pass" });

      // GQ-2: scope filtering and envelope separation. DCS rows divert to
      // reference_material and never ground an answer; TRE rows require
      // evidentiary intent and are dropped (logged) otherwise; rows outside
      // the request's family filter are dropped (logged).
      const answerSupport: ChunkResult[] = [];
      const referenceMaterial: ChunkResult[] = [];
      for (const row of rows) {
        if (row.answer_scope === "guardrail_reference_only") {
          // DCS rows never ground an answer; divert to the reference
          // envelope even when they arrive outside the family filter.
          referenceMaterial.push(row);
          continue;
        }
        if (!familyFilter.includes(row.authority_family)) {
          drops.push({
            chunk_id: row.authority_chunk_id,
            check: "GQ-2",
            reason: `family ${row.authority_family} outside request filter`,
          });
          continue;
        }
        if (
          row.answer_scope === "limited_evidentiary_procedural" &&
          intent !== "evidentiary_procedural"
        ) {
          drops.push({
            chunk_id: row.authority_chunk_id,
            check: "GQ-2",
            reason: "TRE row without evidentiary intent",
          });
          continue;
        }
        if (row.answer_scope === "not_answer_authority") {
          drops.push({
            chunk_id: row.authority_chunk_id,
            check: "GQ-2",
            reason: "row is not answer authority",
          });
          continue;
        }
        answerSupport.push(row);
      }
      checksRun.push({ id: "GQ-2", outcome: "pass" });

      // GQ-5: dedupe by chunk id (exact + full-text paths can overlap).
      const seen = new Set<string>();
      const dedupedSupport = answerSupport.filter((r) => {
        if (seen.has(r.authority_chunk_id)) return false;
        seen.add(r.authority_chunk_id);
        return true;
      });
      checksRun.push({ id: "GQ-5", outcome: "pass" });

      // GQ-3 (zero-authority) is decided by the route from the returned
      // envelope split plus blocked-class counts.
      checksRun.push({ id: "GQ-3", outcome: "pass" });

      return {
        decision: {
          decision: "proceed",
          stage: "retrieval",
          checks_run: checksRun,
          classification: null,
          timing_ms: 0,
          drops,
        },
        answerSupport: dedupedSupport,
        referenceMaterial,
      };
    },

    scanGeneration(answerText) {
      const checksRun: GuardrailCheckRun[] = [];
      for (const cls of GEN_CLASSES) {
        const tripped = cls.regexes.some((r) => r.test(answerText));
        if (tripped) {
          checksRun.push({ id: cls.checkId, outcome: "fail" });
          return {
            decision: refuseDecision(
              "post_generation",
              checksRun,
              "safety_guardrail",
              cls.refusalVariant === "response_side_ruling"
                ? "ruling_recommendation"
                : "leakage_suppressed"
            ),
          };
        }
        checksRun.push({ id: cls.checkId, outcome: "pass" });
      }
      // Excluded-title material reappearing in the generation refuses
      // (GA-3 leakage: closed universe holds on the response side too).
      const scope = detectOutOfScopeQuery(answerText);
      if (scope) {
        checksRun.push({ id: "GA-3", outcome: "fail" });
        return {
          decision: refuseDecision(
            "post_generation",
            checksRun,
            "safety_guardrail",
            "leakage_suppressed"
          ),
        };
      }
      checksRun.push({ id: "GA-3", outcome: "pass" });
      return {
        decision: {
          decision: "proceed",
          stage: "post_generation",
          checks_run: checksRun,
          classification: null,
          timing_ms: 0,
        },
      };
    },
  };
}
