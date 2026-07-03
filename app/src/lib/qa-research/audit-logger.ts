// AuditLogger interface for the QA research path (F5-04 / M1).
// Ordered-write and fail-closed semantics live in the ROUTE: it awaits
// logRetrieval before any streaming, logs refusals at emission, logs
// answers after completion, and converts any logger failure into a
// user-safe refusal (MA-07). The M1 registry binds only the in-memory
// mock sink; the live binding arrives in F5-05 under its own gate chain.

import {
  TargetNotAvailableError,
  type AnswerAuditEntry,
  type CitationVerificationEntry,
  type RefusalRecordEntry,
  type RetrievalLogEntry,
} from "./types";
import { createMockAuditLogger } from "./mock-audit-logger";

export interface AuditLogger {
  logRetrieval(entry: RetrievalLogEntry): Promise<string>;
  logRefusal(entry: RefusalRecordEntry): Promise<string>;
  logAnswer(entry: AnswerAuditEntry): Promise<string>;
  logCitationVerification(entries: CitationVerificationEntry[]): Promise<void>;
}

type AuditFactory = () => AuditLogger;

const M1_AUDIT_REGISTRY: Record<"mock_only", AuditFactory> = {
  mock_only: () => createMockAuditLogger(),
};

export function createAuditLogger(target: string): AuditLogger {
  const factory = M1_AUDIT_REGISTRY[target as "mock_only"];
  if (!factory) {
    throw new TargetNotAvailableError(target);
  }
  return factory();
}
