// In-memory mock audit sink (F5-04 / M1). No persistence, no database,
// no network. Content rules from the F5-02 audit contract are enforced
// structurally at the sink boundary: prohibited body-text field names,
// passage-length strings, and unhashed queries are REJECTED (thrown), so
// a violation fails tests rather than slipping through by convention.

import {
  AuditContentRuleError,
  type AnswerAuditEntry,
  type CitationVerificationEntry,
  type RefusalRecordEntry,
  type RetrievalLogEntry,
} from "./types";
import type { AuditLogger } from "./audit-logger";

const PROHIBITED_FIELD_NAMES = new Set([
  "text",
  "chunk_text",
  "body",
  "body_text",
  "excerpt",
  "passage",
  "gated_chunk_passage",
  "source_text",
  "page_text",
  "ocr_text",
  "full_text",
  "raw_text",
  "query_text",
]);

const STRING_LENGTH_CAP = 240;
const SHA256_HEX = /^[0-9a-f]{64}$/;

export type AuditRecordKind =
  | "retrieval_logs"
  | "refusal_records"
  | "answer_audit_records"
  | "citation_verification_records";

export interface CapturedAuditRecord {
  seq: number;
  kind: AuditRecordKind;
  record_id: string;
  entry: unknown;
}

export interface MockAuditLoggerOptions {
  // Drives MA-07 (fail-closed) and related failure paths.
  failMode?:
    | "throw_on_retrieval"
    | "throw_on_answer"
    | "throw_on_refusal"
    | "throw_on_citations"
    | null;
  productionMode?: boolean;
}

export interface MockAuditLogger extends AuditLogger {
  entries(): CapturedAuditRecord[];
  entriesFor(requestId: string): CapturedAuditRecord[];
}

function assertContentRules(entry: unknown, path = ""): void {
  if (entry === null || entry === undefined) return;
  if (typeof entry === "string") {
    if (entry.length > STRING_LENGTH_CAP) {
      throw new AuditContentRuleError(
        `audit field ${path} exceeds the ${STRING_LENGTH_CAP}-char cap (passage-length content is prohibited in audit records)`
      );
    }
    return;
  }
  if (Array.isArray(entry)) {
    entry.forEach((item, i) => assertContentRules(item, `${path}[${i}]`));
    return;
  }
  if (typeof entry === "object") {
    for (const [key, value] of Object.entries(entry as Record<string, unknown>)) {
      if (PROHIBITED_FIELD_NAMES.has(key.toLowerCase())) {
        throw new AuditContentRuleError(
          `audit field name "${key}" is prohibited in audit records`
        );
      }
      assertContentRules(value, path ? `${path}.${key}` : key);
    }
  }
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${String(idCounter).padStart(6, "0")}`;
}

export function createMockAuditLogger(
  options: MockAuditLoggerOptions = {}
): MockAuditLogger {
  const captured: CapturedAuditRecord[] = [];
  let seq = 0;

  function capture(kind: AuditRecordKind, recordId: string, entry: unknown): void {
    assertContentRules(entry);
    seq += 1;
    captured.push({ seq, kind, record_id: recordId, entry });
  }

  return {
    async logRetrieval(entry: RetrievalLogEntry): Promise<string> {
      if (options.failMode === "throw_on_retrieval") {
        throw new Error("synthetic audit sink failure (test failMode)");
      }
      if (options.productionMode !== false && !SHA256_HEX.test(entry.query_hash)) {
        throw new AuditContentRuleError(
          "retrieval log query_hash must be a sha256 hex digest; raw queries are prohibited"
        );
      }
      const id = entry.retrieval_log_id ?? nextId("SYNRL");
      capture("retrieval_logs", id, { ...entry, retrieval_log_id: id });
      return id;
    },

    async logRefusal(entry: RefusalRecordEntry): Promise<string> {
      if (options.failMode === "throw_on_refusal") {
        throw new Error("synthetic audit sink failure (test failMode)");
      }
      const id = entry.refusal_record_id ?? nextId("SYNRF");
      capture("refusal_records", id, { ...entry, refusal_record_id: id });
      return id;
    },

    async logAnswer(entry: AnswerAuditEntry): Promise<string> {
      if (options.failMode === "throw_on_answer") {
        throw new Error("synthetic audit sink failure (test failMode)");
      }
      if (!SHA256_HEX.test(entry.answer_hash)) {
        throw new AuditContentRuleError(
          "answer audit answer_hash must be a sha256 hex digest; answer text is prohibited"
        );
      }
      const id = entry.answer_audit_record_id ?? nextId("SYNAA");
      capture("answer_audit_records", id, { ...entry, answer_audit_record_id: id });
      return id;
    },

    async logCitationVerification(
      entries: CitationVerificationEntry[]
    ): Promise<void> {
      if (options.failMode === "throw_on_citations") {
        throw new Error("synthetic audit sink failure (test failMode)");
      }
      for (const entry of entries) {
        const id = entry.citation_verification_record_id ?? nextId("SYNCV");
        capture("citation_verification_records", id, {
          ...entry,
          citation_verification_record_id: id,
        });
      }
    },

    entries(): CapturedAuditRecord[] {
      return [...captured];
    },

    entriesFor(requestId: string): CapturedAuditRecord[] {
      return captured.filter(
        (r) => (r.entry as { request_id?: string }).request_id === requestId
      );
    },
  };
}
