// Types for the mock-only QA research path (F5-04 / M1).
// These mirror the six F5-02 contracts under
// docs/fable5-app-integration-readiness/contracts/ field for field.
// The M1 target enum deliberately has NO production member and no
// preview member: a live target is unrepresentable in this phase.

export type EnvironmentTarget = "mock_only";

export const MOCK_ONLY_TARGET: EnvironmentTarget = "mock_only";
export const ENVIRONMENT_LABEL = "MOCK_ONLY";
export const MOCK_BANNER_TEXT =
  "MOCK ONLY - SYNTHETIC DATA - NOT FOR JUDICIAL RELIANCE";
export const NO_PRODUCTION_NOTICE =
  "This build cannot connect to production. All material shown is synthetic.";

export const CORPUS_SCOPE = "tn_closed_universe_v1" as const;

export type SourceFamily =
  | "tca_title_36"
  | "tca_title_37"
  | "tenn_rules_juvenile_practice_procedure"
  | "tenn_rules_evidence"
  | "dcs_policies_procedures";

export const ALL_FAMILIES: SourceFamily[] = [
  "tca_title_36",
  "tca_title_37",
  "tenn_rules_juvenile_practice_procedure",
  "tenn_rules_evidence",
  "dcs_policies_procedures",
];

export type AnswerScope =
  | "general_answer_authority"
  | "guardrail_reference_only"
  | "limited_evidentiary_procedural"
  | "internal_qa_only"
  | "not_answer_authority";

export type AnswerScopeIntent =
  | "general_answer"
  | "evidentiary_procedural"
  | "reference_only";

export type RetrievalMode = "exact_citation" | "full_text" | "hybrid_future";

export type VersionStatus =
  | "current"
  | "superseded"
  | "future_effective"
  | "unknown_effectivity";

export type BlockedClass =
  | "restricted"
  | "pending_qa"
  | "unknown_effectivity"
  | "future_effective"
  | "superseded";

// --- legal_retrieval_request contract ---

export interface QueryClassification {
  guardrail_decision: "proceed" | "refuse";
  answer_scope_intent: AnswerScopeIntent;
  detected_citation_count: number;
}

export interface LegalRetrievalRequest {
  request_id: string;
  user_id: string;
  environment_target: EnvironmentTarget;
  corpus_scope: typeof CORPUS_SCOPE;
  query_classification: QueryClassification;
  retrieval_mode: RetrievalMode;
  detected_citations: string[];
  family_filter: SourceFamily[];
  answer_scope_intent: AnswerScopeIntent;
  as_of_date: string;
  result_limit: number;
}

// --- legal_retrieval_response contract ---

export interface ChunkResult {
  authority_chunk_id: string;
  authority_unit_id: string;
  authority_version_id: string;
  canonical_citation: string;
  normalized_citation: string;
  authority_family: SourceFamily;
  answer_scope: AnswerScope;
  chunk_type: string;
  page_start: number;
  page_end: number;
  text_sha256: string;
  rank: number | null;
  version_status: VersionStatus;
  effective_start: string | null;
  effective_end: string | null;
  qa_signoff_status: string;
  source_file_sha256: string;
  source_path_label: string;
  synthetic: true;
  // Runtime-only field for prompt assembly; never persisted to audit
  // entries; always a synthetic placeholder in M1.
  gated_chunk_passage: string;
}

export interface GateAttestation {
  all_rows_displayable: boolean;
  no_restricted_rows: boolean;
  no_pending_rows: boolean;
  scope_filter_applied: boolean;
}

export interface BlockedClassCounts {
  restricted: number;
  pending_qa: number;
  unknown_effectivity: number;
  future_effective: number;
  superseded: number;
}

export interface LegalRetrievalResponse {
  request_id: string;
  environment_target: string;
  outcome: "results" | "no_authority" | "refused_pre_retrieval";
  results: ChunkResult[];
  answer_support_count: number;
  reference_material_count: number;
  blocked_class_counts: BlockedClassCounts;
  effective_basis: {
    as_of_date: string;
    all_version_status: VersionStatus | "mixed" | "none";
  };
  gate_attestation: GateAttestation;
  refusal: RefusalObject | null;
  audit: { retrieval_log_id: string | null };
}

// --- citation_object contract ---

export type CitationVerificationLevel =
  | "verified_retrieved"
  | "verified_resolved"
  | "unresolved"
  | "out_of_universe";

export interface CitationObject {
  source_family: SourceFamily;
  authority_unit_id: string;
  authority_version_id: string;
  authority_chunk_id: string;
  canonical_citation: string;
  normalized_citation: string;
  source_file_sha256: string;
  source_path_label: string;
  page_start: number;
  page_end: number;
  display_status: string;
  answer_scope: AnswerScope;
  effectivity: {
    version_status: VersionStatus;
    effective_label: string;
    as_of_date_used: string;
  };
  qa_signoff_status: string;
  verification: {
    level: CitationVerificationLevel;
    exists_in_corpus: boolean;
    current_as_of_date: boolean;
    display_allowed: boolean;
    proposition_supported: boolean | null;
  };
  environment_tier: string;
  scope_tag: "general" | "evidentiary" | "reference_only";
  granularity_clamped: boolean;
}

// --- refusal_object contract ---

export type RefusalKind =
  | "out_of_scope"
  | "no_authority_support"
  | "future_effective_only"
  | "restricted_display_only"
  | "unsupported_answer"
  | "safety_guardrail";

export type RefusalStage = "pre_retrieval" | "retrieval" | "post_generation";

export interface RefusalObject {
  refusal_id: string;
  refusal_kind: RefusalKind;
  refusal_variant: string;
  stage: RefusalStage;
  user_message_key: string;
  user_message_title: string;
  user_message: string;
  permissible_help: string[];
  matched_terms_hash: string | null;
  audit: {
    retrieval_log_id: string | null;
    refusal_record_id: string | null;
  };
  environment_target: string;
}

// --- guardrail_decision contract ---

export type GuardrailCheckId =
  | "GP-1" | "GP-2" | "GP-3" | "GP-4" | "GP-5"
  | "GP-6" | "GP-7" | "GP-8" | "GP-9"
  | "GQ-1" | "GQ-2" | "GQ-3" | "GQ-4" | "GQ-5"
  | "GA-1" | "GA-2" | "GA-3" | "GA-4";

export interface GuardrailCheckRun {
  id: GuardrailCheckId;
  outcome: "pass" | "fail" | "error";
  matched_terms_hash?: string;
}

export interface GuardrailDecision {
  decision: "proceed" | "refuse" | "flag_reference_only";
  stage: RefusalStage;
  checks_run: GuardrailCheckRun[];
  classification: QueryClassification | null;
  timing_ms: number;
  refusal_kind?: RefusalKind;
  refusal_variant?: string;
  drops?: Array<{ chunk_id: string; check: GuardrailCheckId; reason: string }>;
  defect_alert?: boolean;
}

// --- audit_log_object contract ---

export interface RetrievalLogEntry {
  retrieval_log_id?: string;
  request_id: string;
  user_id: string;
  corpus_build_id: string;
  query_hash: string;
  retrieval_mode: RetrievalMode;
  as_of_date: string;
  filters: {
    families: SourceFamily[];
    answer_scope_intent: AnswerScopeIntent;
  };
  candidate_chunk_ids_count: number;
  returned_chunk_ids_count: number;
  returned_chunk_ids: string[];
  refused_before_generation: boolean;
  environment_target: string;
}

export interface RefusalRecordEntry {
  refusal_record_id?: string;
  request_id: string;
  retrieval_log_id: string | null;
  refusal_kind: RefusalKind;
  refusal_variant: string;
  stage: RefusalStage;
  user_message_key: string;
  matched_terms_hash: string | null;
  environment_target: string;
}

export interface AnswerAuditEntry {
  answer_audit_record_id?: string;
  request_id: string;
  retrieval_log_id: string | null;
  model_provider: string;
  model_name: string;
  prompt_package_hash: string;
  system_prompt_version: string;
  retrieved_chunk_ids_count: number;
  displayed_citation_alias_ids_count: number;
  answer_hash: string;
  trust_metadata_keys: string[];
  unsupported_proposition_count: number | null;
  refusal_record_id: string | null;
  answer_suppressed: boolean;
  environment_target: string;
}

export interface CitationVerificationEntry {
  citation_verification_record_id?: string;
  request_id: string;
  answer_audit_record_id: string;
  normalized_citation: string;
  verification_level: CitationVerificationLevel;
  exists_in_corpus: boolean;
  current_as_of_date: boolean;
  display_allowed: boolean;
  supporting_chunk_ids_count: number;
}

// --- SSE envelope ---

export type SseEventName =
  | "environment"
  | "delta"
  | "citations"
  | "sources"
  | "refusal"
  | "confidence"
  | "coverage"
  | "done";

export type ResponseClass =
  | "ANSWER"
  | "REFERENCE"
  | "REFUSE_NO_AUTHORITY"
  | "REFUSE_GUARDRAIL"
  | "REFUSE_TARGET"
  | "ERROR";

export interface EnvironmentEvent {
  target: EnvironmentTarget | string;
  label: string;
  banner: string;
  tier: "mock";
  no_production_notice: string;
  fixture_manifest_sha256: string;
  as_of_date: string;
}

export interface DoneEvent {
  response_class: ResponseClass;
  request_id: string;
  audit: {
    retrieval_log_id: string | null;
    answer_audit_record_id: string | null;
    refusal_record_id: string | null;
    citation_verification_record_count: number;
  };
  model_called: boolean;
}

export class TargetNotAvailableError extends Error {
  constructor(target: string) {
    super(
      `QA research target "${target}" is not available in the M1 mock-only registry`
    );
    this.name = "TargetNotAvailableError";
  }
}

export class EnvironmentValidationError extends Error {
  readonly variables: string[];
  constructor(message: string, variables: string[]) {
    super(message);
    this.name = "EnvironmentValidationError";
    this.variables = variables;
  }
}

export class AuditContentRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditContentRuleError";
  }
}
