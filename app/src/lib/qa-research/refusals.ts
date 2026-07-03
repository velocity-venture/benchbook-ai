// Refusal envelope builder for the mock-only QA research path (F5-04 / M1).
// User-facing wording resolves ONLY from refusal-templates.json (owner
// review P6); a missing template is a hard error, never free generation.

import templateData from "./refusal-templates.json";
import type { RefusalKind, RefusalObject, RefusalStage } from "./types";

interface RefusalTemplate {
  kind: string;
  title: string;
  message: string;
  permissible_help: string[];
}

const TEMPLATES: Record<string, RefusalTemplate> = templateData.templates;

const VALID_KINDS: RefusalKind[] = [
  "out_of_scope",
  "no_authority_support",
  "future_effective_only",
  "restricted_display_only",
  "unsupported_answer",
  "safety_guardrail",
];

export class RefusalTemplateError extends Error {
  constructor(key: string) {
    super(`No owner-reviewed refusal template exists for key "${key}"`);
    this.name = "RefusalTemplateError";
  }
}

export function templateKeyFor(variant: string): string {
  return `refusal.${variant}.v1`;
}

export interface BuildRefusalInput {
  refusalId: string;
  kind: RefusalKind;
  variant: string;
  stage: RefusalStage;
  environmentTarget: string;
  matchedTermsHash?: string | null;
  retrievalLogId?: string | null;
  refusalRecordId?: string | null;
}

export function buildRefusalObject(input: BuildRefusalInput): RefusalObject {
  const key = templateKeyFor(input.variant);
  const template = TEMPLATES[key];
  if (!template) {
    throw new RefusalTemplateError(key);
  }
  if (!VALID_KINDS.includes(input.kind)) {
    throw new Error(`Refusal kind "${input.kind}" is outside the schema enum`);
  }
  return {
    refusal_id: input.refusalId,
    refusal_kind: input.kind,
    refusal_variant: input.variant,
    stage: input.stage,
    user_message_key: key,
    user_message_title: template.title,
    user_message: template.message,
    permissible_help: [...template.permissible_help],
    matched_terms_hash: input.matchedTermsHash ?? null,
    audit: {
      retrieval_log_id: input.retrievalLogId ?? null,
      refusal_record_id: input.refusalRecordId ?? null,
    },
    environment_target: input.environmentTarget,
  };
}
