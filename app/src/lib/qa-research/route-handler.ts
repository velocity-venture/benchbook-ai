// Mock-only QA research request pipeline (F5-04 / M1).
//
// Extracted behind the route file because Next.js route modules may only
// export route fields; the API route wraps createQaResearchHandler().
//
// This pipeline serves SYNTHETIC data through the LegalRetrievalAdapter
// interface and is the first binding of the future app integration
// contract. It has no external data client import, no database endpoint,
// no vector call, and no web retrieval path; the M1 factories are
// structurally unable to produce a live binding. It never replaces
// /api/chat.
//
// Lifecycle: boot validation -> input validation -> pre-retrieval
// guardrails (GP) -> adapter retrieval -> post-retrieval gates (GQ) ->
// prompt assembly -> scripted mock generation -> post-generation gates
// (GA, citation verification) -> ordered audit writes -> SSE envelope.
// Every failure path fails closed to a refusal or error envelope.
import {
  bootValidate,
  readProcessEnv,
  type BootReport,
} from "./environment";
import {
  createRetrievalAdapter,
  RESULT_LIMIT_CAP,
  type LegalRetrievalAdapter,
} from "./retrieval-adapter";
import {
  createModelClient,
  type GenerationResult,
  type ModelClient,
} from "./model-client";
import { createAuditLogger, type AuditLogger } from "./audit-logger";
import {
  createGuardrailService,
  type ConversationTurn,
  type GuardrailService,
} from "./guardrail";
import { buildRefusalObject } from "./refusals";
import {
  buildCitationObject,
  confidenceFor,
  verifyGeneration,
} from "./citation-verifier";
import {
  buildPromptPackage,
  sha256Hex,
  SYSTEM_PROMPT_VERSION,
} from "./prompt-contract";
import {
  MOCK_BANNER_TEXT,
  NO_PRODUCTION_NOTICE,
  type AnswerScopeIntent,
  type ChunkResult,
  type CitationObject,
  type DoneEvent,
  type RefusalKind,
  type RefusalObject,
  type RefusalStage,
  type ResponseClass,
  type RetrievalMode,
  type SourceFamily,
} from "./types";


const MAX_QUERY_LENGTH = 2000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const SYNTHETIC_USER_ID = "SYNUSER-QA";
const ALLOWED_BODY_KEYS = new Set([
  "query",
  "messages",
  "as_of_date",
  "request_id",
  "result_limit",
]);

export interface QaRouteDeps {
  bootReport: BootReport;
  adapter: LegalRetrievalAdapter;
  modelClient: ModelClient;
  auditLogger: AuditLogger;
  guardrail: GuardrailService;
  // M-2 ratified default: allow all authenticated users in M1 (synthetic
  // data only; platform middleware/layout enforce authentication). This
  // hook is the tightening point before any live target.
  accessCheck: () => Promise<boolean>;
  today: () => string;
  newId: (prefix: string) => string;
}

let idSeq = 0;
function defaultNewId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${String(idSeq).padStart(4, "0")}`;
}

function defaultToday(): string {
  return new Date().toISOString().slice(0, 10);
}

let defaultDeps: QaRouteDeps | null = null;
function resolveDefaultDeps(): QaRouteDeps {
  if (defaultDeps) return defaultDeps;
  const report = bootValidate(readProcessEnv());
  const target = report.environment?.target ?? "mock_only";
  defaultDeps = {
    bootReport: report,
    adapter: report.ok ? createRetrievalAdapter(target) : createRetrievalAdapter("mock_only"),
    modelClient: report.ok ? createModelClient(target) : createModelClient("mock_only"),
    auditLogger: report.ok ? createAuditLogger(target) : createAuditLogger("mock_only"),
    guardrail: createGuardrailService(),
    accessCheck: async () => true,
    today: defaultToday,
    newId: defaultNewId,
  };
  return defaultDeps;
}

// --- SSE assembly -------------------------------------------------------

interface SseEvent {
  event: string;
  data: unknown;
}

function sseResponse(events: SseEvent[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const e of events) {
        controller.enqueue(
          encoder.encode(`event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`)
        );
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Environment-Label": "MOCK_ONLY",
    },
  });
}

// --- helpers ------------------------------------------------------------

function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2)
    )
  );
}

function familiesFor(intent: AnswerScopeIntent): SourceFamily[] {
  switch (intent) {
    case "evidentiary_procedural":
      return ["tenn_rules_evidence"];
    case "reference_only":
      return ["dcs_policies_procedures"];
    default:
      return [
        "tca_title_36",
        "tca_title_37",
        "tenn_rules_juvenile_practice_procedure",
      ];
  }
}

function referenceCitations(
  rows: ChunkResult[],
  asOfDate: string
): CitationObject[] {
  return rows.map((row) =>
    buildCitationObject({
      row,
      level: "verified_retrieved",
      asOfDate,
      environmentTier: "mock",
      granularityClamped: false,
    })
  );
}

// --- handler ------------------------------------------------------------

export function createQaResearchHandler(
  overrides: Partial<QaRouteDeps> = {}
): (req: Request) => Promise<Response> {
  return async function handle(req: Request): Promise<Response> {
    const base = overrides.bootReport ? null : resolveDefaultDeps();
    const deps: QaRouteDeps = {
      ...(base ?? ({} as QaRouteDeps)),
      ...overrides,
    } as QaRouteDeps;
    deps.guardrail = deps.guardrail ?? createGuardrailService();
    deps.accessCheck = deps.accessCheck ?? (async () => true);
    deps.today = deps.today ?? defaultToday;
    deps.newId = deps.newId ?? defaultNewId;
    const report = deps.bootReport;

    // ME-06: invalid boot configuration makes the route unavailable.
    if (report.mode === "unavailable") {
      return new Response(
        JSON.stringify({
          available: false,
          reason: "environment_invalid",
          alerts: report.alerts,
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const today = deps.today ?? defaultToday;
    const newId = deps.newId ?? defaultNewId;
    const requestIdFallback = newId("SYNREQ");

    // ME-04 / GG-01: production-shaped target refuses every request with
    // variant target_control, loudly, before any processing.
    if (report.mode === "refuse_target_control" || report.environment === null) {
      const refusal = buildRefusalObject({
        refusalId: newId("SYNRFID"),
        kind: "safety_guardrail",
        variant: "target_control",
        stage: "pre_retrieval",
        environmentTarget: "refused",
      });
      let refusalRecordId: string | null = null;
      try {
        refusalRecordId = await deps.auditLogger.logRefusal({
          request_id: requestIdFallback,
          retrieval_log_id: null,
          refusal_kind: refusal.refusal_kind,
          refusal_variant: refusal.refusal_variant,
          stage: refusal.stage,
          user_message_key: refusal.user_message_key,
          matched_terms_hash: null,
          environment_target: "refused",
        });
      } catch {
        refusalRecordId = null;
      }
      refusal.audit.refusal_record_id = refusalRecordId;
      return sseResponse([
        {
          event: "environment",
          data: {
            target: "refused",
            label: "MOCK_ONLY",
            banner: MOCK_BANNER_TEXT,
            tier: "mock",
            no_production_notice: NO_PRODUCTION_NOTICE,
            fixture_manifest_sha256: null,
            as_of_date: today(),
            boot_alert: true,
            alerts: report.alerts,
          },
        },
        { event: "refusal", data: refusal },
        { event: "confidence", data: { value: "LOW", note: "refusal, not a legal answer" } },
        {
          event: "done",
          data: {
            response_class: "REFUSE_TARGET",
            request_id: requestIdFallback,
            audit: {
              retrieval_log_id: null,
              answer_audit_record_id: null,
              refusal_record_id: refusalRecordId,
              citation_verification_record_count: 0,
            },
            model_called: false,
          } satisfies DoneEvent,
        },
      ]);
    }

    const environment = report.environment;

    if (!(await deps.accessCheck())) {
      return new Response(JSON.stringify({ error: "not_authorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- input validation ------------------------------------------------
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return inputInvalid(environment.target);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return inputInvalid(environment.target);
    }
    for (const key of Object.keys(body)) {
      if (!ALLOWED_BODY_KEYS.has(key)) return inputInvalid(environment.target);
    }
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (query.length === 0 || query.length > MAX_QUERY_LENGTH) {
      return inputInvalid(environment.target);
    }
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    if (rawMessages.length > MAX_MESSAGES) return inputInvalid(environment.target);
    const window: ConversationTurn[] = [];
    for (const m of rawMessages) {
      const turn = m as { role?: unknown; content?: unknown };
      if (
        (turn.role !== "user" && turn.role !== "assistant") ||
        typeof turn.content !== "string" ||
        turn.content.length > MAX_MESSAGE_LENGTH
      ) {
        return inputInvalid(environment.target);
      }
      window.push({ role: turn.role, content: turn.content });
    }
    let asOfDate = today();
    if (body.as_of_date !== undefined) {
      if (
        typeof body.as_of_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(body.as_of_date)
      ) {
        return inputInvalid(environment.target);
      }
      // The contract forbids future research dates; clamp to today.
      asOfDate = body.as_of_date > today() ? today() : body.as_of_date;
    }
    const requestId =
      typeof body.request_id === "string" && body.request_id.length <= 64
        ? body.request_id
        : requestIdFallback;
    let resultLimit = RESULT_LIMIT_CAP;
    if (body.result_limit !== undefined) {
      if (typeof body.result_limit !== "number" || !Number.isFinite(body.result_limit)) {
        return inputInvalid(environment.target);
      }
      // MR-10: clamp to the RPC hard cap before the adapter call.
      resultLimit = Math.max(1, Math.min(Math.floor(body.result_limit), RESULT_LIMIT_CAP));
    }

    const health = deps.adapter.healthProbe();
    const environmentEvent: SseEvent = {
      event: "environment",
      data: {
        target: environment.target,
        label: environment.label,
        banner: MOCK_BANNER_TEXT,
        tier: "mock",
        no_production_notice: NO_PRODUCTION_NOTICE,
        fixture_manifest_sha256: health.fixture_manifest_sha256,
        as_of_date: asOfDate,
      },
    };

    async function refusalEnvelope(input: {
      kind: RefusalKind;
      variant: string;
      stage: RefusalStage;
      retrievalLogId?: string | null;
      responseClass?: ResponseClass;
      matchedTermsHash?: string | null;
      defectAlert?: boolean;
      extraEvents?: SseEvent[];
    }): Promise<Response> {
      const refusal: RefusalObject = buildRefusalObject({
        refusalId: newId("SYNRFID"),
        kind: input.kind,
        variant: input.variant,
        stage: input.stage,
        environmentTarget: environment.target,
        matchedTermsHash: input.matchedTermsHash ?? null,
        retrievalLogId: input.retrievalLogId ?? null,
      });
      let refusalRecordId: string | null = null;
      try {
        refusalRecordId = await deps.auditLogger.logRefusal({
          request_id: requestId,
          retrieval_log_id: input.retrievalLogId ?? null,
          refusal_kind: refusal.refusal_kind,
          refusal_variant: refusal.refusal_variant,
          stage: refusal.stage,
          user_message_key: refusal.user_message_key,
          matched_terms_hash: refusal.matched_terms_hash,
          environment_target: environment.target,
        });
      } catch {
        refusalRecordId = null;
      }
      refusal.audit.refusal_record_id = refusalRecordId;
      return sseResponse([
        environmentEvent,
        ...(input.extraEvents ?? []),
        { event: "refusal", data: { ...refusal, defect_alert: input.defectAlert ?? false } },
        { event: "confidence", data: { value: "LOW", note: "refusal, not a legal answer" } },
        {
          event: "done",
          data: {
            response_class: input.responseClass ?? "REFUSE_GUARDRAIL",
            request_id: requestId,
            audit: {
              retrieval_log_id: input.retrievalLogId ?? null,
              answer_audit_record_id: null,
              refusal_record_id: refusalRecordId,
              citation_verification_record_count: 0,
            },
            model_called: false,
          } satisfies DoneEvent,
        },
      ]);
    }

    function inputInvalid(target: string): Response {
      const refusal = buildRefusalObject({
        refusalId: newId("SYNRFID"),
        kind: "out_of_scope",
        variant: "input_invalid",
        stage: "pre_retrieval",
        environmentTarget: target,
      });
      return new Response(JSON.stringify({ refusal }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- pre-retrieval guardrails (GP series) ----------------------------
    const pre = deps.guardrail.preRetrieval(query, window);
    if (pre.decision.decision === "refuse") {
      return refusalEnvelope({
        kind: pre.decision.refusal_kind ?? "safety_guardrail",
        variant: pre.decision.refusal_variant ?? "classifier_error",
        stage: "pre_retrieval",
        responseClass: "REFUSE_GUARDRAIL",
        matchedTermsHash: await sha256Hex(pre.decision.refusal_variant ?? "unknown"),
      });
    }
    const classification = pre.classification!;
    const intent = classification.answer_scope_intent;
    const familyFilter = familiesFor(intent);
    const retrievalMode: RetrievalMode =
      classification.detected_citations.length > 0 ? "exact_citation" : "full_text";

    // --- retrieval --------------------------------------------------------
    const terms = [
      ...tokenize(query),
      ...classification.detected_citations.map((c) => c.toLowerCase()),
    ];
    let search;
    try {
      search = await deps.adapter.searchDisplayableChunks(
        terms,
        asOfDate,
        familyFilter,
        resultLimit
      );
    } catch {
      // MR-08: adapter failure fails closed; audit still written.
      let retrievalLogId: string | null = null;
      try {
        retrievalLogId = await deps.auditLogger.logRetrieval({
          request_id: requestId,
          user_id: SYNTHETIC_USER_ID,
          corpus_build_id: health.fixture_manifest_sha256,
          query_hash: await sha256Hex(query),
          retrieval_mode: retrievalMode,
          as_of_date: asOfDate,
          filters: { families: familyFilter, answer_scope_intent: intent },
          candidate_chunk_ids_count: 0,
          returned_chunk_ids_count: 0,
          returned_chunk_ids: [],
          refused_before_generation: true,
          environment_target: environment.target,
        });
      } catch {
        retrievalLogId = null;
      }
      return refusalEnvelope({
        kind: "no_authority_support",
        variant: "retrieval_error",
        stage: "retrieval",
        retrievalLogId,
        responseClass: "REFUSE_NO_AUTHORITY",
      });
    }

    // ME-05 / SC-1: environment echo must match the pinned target.
    try {
      environment.assertEcho(search.environment_echo);
    } catch {
      return refusalEnvelope({
        kind: "safety_guardrail",
        variant: "target_control",
        stage: "retrieval",
        responseClass: "REFUSE_TARGET",
        defectAlert: true,
      });
    }

    // --- post-retrieval gates (GQ series) ---------------------------------
    const attestation = deps.adapter.attestGates(search.rows);
    const attestationOk =
      attestation.all_rows_displayable &&
      attestation.no_restricted_rows &&
      attestation.no_pending_rows &&
      attestation.scope_filter_applied;

    const post = deps.guardrail.postRetrieval(
      search.rows,
      intent,
      familyFilter,
      asOfDate
    );

    // Ordered-write rule (MA-01/MA-03/MA-07): the retrieval log is written
    // before any generation or answer streaming; its failure fails closed.
    const refusedBeforeGeneration =
      !attestationOk ||
      post.decision.decision === "refuse" ||
      post.answerSupport.length === 0;
    let retrievalLogId: string;
    try {
      retrievalLogId = await deps.auditLogger.logRetrieval({
        request_id: requestId,
        user_id: SYNTHETIC_USER_ID,
        corpus_build_id: health.fixture_manifest_sha256,
        query_hash: await sha256Hex(query),
        retrieval_mode: retrievalMode,
        as_of_date: asOfDate,
        filters: { families: familyFilter, answer_scope_intent: intent },
        candidate_chunk_ids_count: search.candidate_count,
        returned_chunk_ids_count: search.rows.length,
        returned_chunk_ids: search.rows.map((r) => r.authority_chunk_id),
        refused_before_generation: refusedBeforeGeneration,
        environment_target: environment.target,
      });
    } catch {
      // MA-07: no unaudited answer; user-safe refusal without retrieval log.
      return refusalEnvelope({
        kind: "no_authority_support",
        variant: "audit_write_failure",
        stage: "retrieval",
        responseClass: "REFUSE_NO_AUTHORITY",
        defectAlert: true,
      });
    }

    if (!attestationOk || post.decision.decision === "refuse") {
      // MR-09 / GG-07 / gate defects: internal-error refusal, never a
      // degraded answer.
      return refusalEnvelope({
        kind: post.decision.refusal_kind ?? "no_authority_support",
        variant: post.decision.refusal_variant ?? "internal_gate_error",
        stage: "retrieval",
        retrievalLogId,
        responseClass: "REFUSE_NO_AUTHORITY",
        defectAlert: true,
      });
    }

    const { answerSupport, referenceMaterial } = post;

    if (answerSupport.length === 0 && referenceMaterial.length === 0) {
      // Zero displayable authority: refusal variant by blocked class,
      // most restrictive first (RF-01, RF-08..RF-11).
      const blocked = search.blocked_class_counts;
      let kind: RefusalKind = "no_authority_support";
      let variant = "none_found";
      if (blocked.restricted > 0) {
        kind = "restricted_display_only";
        variant = "restricted_lexis";
      } else if (blocked.future_effective > 0) {
        kind = "future_effective_only";
        variant = "future_effective";
      } else if (blocked.pending_qa > 0) {
        variant = "pending_qa_only";
      } else if (blocked.unknown_effectivity > 0) {
        variant = "unknown_effectivity";
      }
      return refusalEnvelope({
        kind,
        variant,
        stage: "retrieval",
        retrievalLogId,
        responseClass: "REFUSE_NO_AUTHORITY",
      });
    }

    const coverageEvent: SseEvent = {
      event: "coverage",
      data: {
        answer_support_count: answerSupport.length,
        reference_material_count: referenceMaterial.length,
        families: Array.from(
          new Set([...answerSupport, ...referenceMaterial].map((r) => r.authority_family))
        ),
        as_of_date: asOfDate,
        drops: post.decision.drops ?? [],
      },
    };

    if (answerSupport.length === 0) {
      // REFERENCE class (MR-06): DCS reference cards only; the model is
      // never called because nothing can ground an answer.
      const refCitations = referenceCitations(referenceMaterial, asOfDate);
      return sseResponse([
        environmentEvent,
        {
          event: "citations",
          data: {
            citations: [],
            reference_material: refCitations.map((c) => ({
              ...c,
              reference_tag: "not_controlling_authority",
            })),
            warnings: [],
          },
        },
        {
          event: "sources",
          data: refCitations.map((c) => ({
            citation: c.canonical_citation,
            family: c.source_family,
            scope_tag: c.scope_tag,
          })),
        },
        {
          event: "confidence",
          data: {
            value: "LOW",
            note: "reference material only; not controlling authority; DCS never counts toward confidence",
          },
        },
        coverageEvent,
        {
          event: "done",
          data: {
            response_class: "REFERENCE",
            request_id: requestId,
            audit: {
              retrieval_log_id: retrievalLogId,
              answer_audit_record_id: null,
              refusal_record_id: null,
              citation_verification_record_count: 0,
            },
            model_called: false,
          } satisfies DoneEvent,
        },
      ]);
    }

    // --- generation --------------------------------------------------------
    const spans = await deps.adapter.deliverSpans(
      answerSupport.map((r) => r.authority_chunk_id)
    );
    const prompt = await buildPromptPackage({
      query,
      asOfDate,
      answerSupport,
      spans,
    });

    const deltas: string[] = [];
    let generation: GenerationResult | undefined;
    try {
      generation = await deps.modelClient.streamAnswer(prompt, (d) => deltas.push(d));
    } catch {
      generation = undefined;
    }
    if (!generation) {
      return refusalEnvelope({
        kind: "no_authority_support",
        variant: "retrieval_error",
        stage: "post_generation",
        retrievalLogId,
        responseClass: "REFUSE_NO_AUTHORITY",
      });
    }
    const generationFinal = generation;
    const answerText = generationFinal.text;
    const answerHash = await sha256Hex(answerText);

    async function suppressedAnswerAudit(refusalRecordId: string | null) {
      // MA-04: the answer audit row is written for conversions, retaining
      // the hash of the suppressed answer and linking the refusal record.
      return deps.auditLogger.logAnswer({
        request_id: requestId,
        retrieval_log_id: retrievalLogId,
        model_provider: "mock_scripted",
        model_name: generationFinal.model_name,
        prompt_package_hash: prompt.prompt_package_hash,
        system_prompt_version: SYSTEM_PROMPT_VERSION,
        retrieved_chunk_ids_count: answerSupport.length,
        displayed_citation_alias_ids_count: 0,
        answer_hash: answerHash,
        trust_metadata_keys: [],
        unsupported_proposition_count: null,
        refusal_record_id: refusalRecordId,
        answer_suppressed: true,
        environment_target: environment.target,
      });
    }

    async function conversionRefusal(input: {
      kind: RefusalKind;
      variant: string;
      responseClass?: ResponseClass;
    }): Promise<Response> {
      const refusal = buildRefusalObject({
        refusalId: newId("SYNRFID"),
        kind: input.kind,
        variant: input.variant,
        stage: "post_generation",
        environmentTarget: environment.target,
        retrievalLogId,
      });
      let refusalRecordId: string | null = null;
      try {
        refusalRecordId = await deps.auditLogger.logRefusal({
          request_id: requestId,
          retrieval_log_id: retrievalLogId,
          refusal_kind: refusal.refusal_kind,
          refusal_variant: refusal.refusal_variant,
          stage: "post_generation",
          user_message_key: refusal.user_message_key,
          matched_terms_hash: null,
          environment_target: environment.target,
        });
        await suppressedAnswerAudit(refusalRecordId);
      } catch {
        refusalRecordId = refusalRecordId ?? null;
      }
      refusal.audit.refusal_record_id = refusalRecordId;
      return sseResponse([
        environmentEvent,
        { event: "refusal", data: { ...refusal, defect_alert: false } },
        { event: "confidence", data: { value: "LOW", note: "refusal, not a legal answer" } },
        {
          event: "done",
          data: {
            response_class: input.responseClass ?? "REFUSE_GUARDRAIL",
            request_id: requestId,
            audit: {
              retrieval_log_id: retrievalLogId,
              answer_audit_record_id: null,
              refusal_record_id: refusalRecordId,
              citation_verification_record_count: 0,
            },
            model_called: true,
          } satisfies DoneEvent,
        },
      ]);
    }

    if (answerText.trim() === "NO_SUPPORTED_ANSWER") {
      return conversionRefusal({
        kind: "unsupported_answer",
        variant: "model_no_support",
        responseClass: "REFUSE_NO_AUTHORITY",
      });
    }

    // GA-2 / GA-3: response-side ruling recommendations, leakage markers,
    // and excluded-title reintroduction suppress the answer.
    const scan = deps.guardrail.scanGeneration(answerText);
    if (scan.decision.decision === "refuse") {
      return conversionRefusal({
        kind: scan.decision.refusal_kind ?? "safety_guardrail",
        variant: scan.decision.refusal_variant ?? "leakage_suppressed",
      });
    }

    // GA-1: citation verification (mandatory citations, fail closed).
    const verification = await verifyGeneration({
      answerText,
      answerSupport,
      knownRows: answerSupport,
      adapter: deps.adapter,
      asOfDate,
      environmentTier: "mock",
    });
    if (verification.outOfUniverse) {
      return conversionRefusal({
        kind: "safety_guardrail",
        variant: "leakage_suppressed",
      });
    }
    if (
      verification.verifiedRetrievedCount + verification.verifiedResolvedCount ===
      0
    ) {
      // T-CIT-MISSING / MC-08 / RF-14: no verified citation, no answer.
      return conversionRefusal({
        kind: "no_authority_support",
        variant: "citation_validation_failure",
        responseClass: "REFUSE_NO_AUTHORITY",
      });
    }

    // --- success: ordered audit writes then envelope ----------------------
    const confidence = confidenceFor(verification);
    let answerAuditRecordId: string;
    try {
      answerAuditRecordId = await deps.auditLogger.logAnswer({
        request_id: requestId,
        retrieval_log_id: retrievalLogId,
        model_provider: "mock_scripted",
        model_name: generationFinal.model_name,
        prompt_package_hash: prompt.prompt_package_hash,
        system_prompt_version: SYSTEM_PROMPT_VERSION,
        retrieved_chunk_ids_count: answerSupport.length,
        displayed_citation_alias_ids_count: verification.citations.length,
        answer_hash: answerHash,
        trust_metadata_keys: ["confidence_level", "verification_levels", "coverage_basis"],
        unsupported_proposition_count: null,
        refusal_record_id: null,
        answer_suppressed: false,
        environment_target: environment.target,
      });
      await deps.auditLogger.logCitationVerification(
        verification.citations.map((c) => ({
          request_id: requestId,
          answer_audit_record_id: answerAuditRecordId,
          normalized_citation: c.normalized_citation,
          verification_level: c.verification.level,
          exists_in_corpus: c.verification.exists_in_corpus,
          current_as_of_date: c.verification.current_as_of_date,
          display_allowed: c.verification.display_allowed,
          supporting_chunk_ids_count: 1,
        }))
      );
    } catch {
      // Fail closed: an unaudited answer is never streamed (MA-07).
      return refusalEnvelope({
        kind: "no_authority_support",
        variant: "audit_write_failure",
        stage: "post_generation",
        retrievalLogId,
        responseClass: "REFUSE_NO_AUTHORITY",
        defectAlert: true,
      });
    }

    const refCitations = referenceCitations(referenceMaterial, asOfDate);
    return sseResponse([
      environmentEvent,
      ...deltas.map((d) => ({ event: "delta", data: { text: d } })),
      {
        event: "citations",
        data: {
          citations: verification.citations,
          reference_material: refCitations.map((c) => ({
            ...c,
            reference_tag: "not_controlling_authority",
          })),
          warnings: verification.warnings,
        },
      },
      {
        event: "sources",
        data: verification.citations.map((c) => ({
          citation: c.canonical_citation,
          family: c.source_family,
          scope_tag: c.scope_tag,
        })),
      },
      {
        event: "confidence",
        data: {
          value: confidence,
          note:
            verification.verifiedResolvedCount > 0
              ? "confidence capped: at least one citation verified by resolution only (M1 demotion policy)"
              : "all citations verified against retrieved synthetic passages",
        },
      },
      coverageEvent,
      {
        event: "done",
        data: {
          response_class: "ANSWER",
          request_id: requestId,
          audit: {
            retrieval_log_id: retrievalLogId,
            answer_audit_record_id: answerAuditRecordId,
            refusal_record_id: null,
            citation_verification_record_count: verification.citations.length,
          },
          model_called: true,
        } satisfies DoneEvent,
      },
    ]);
  };
}

