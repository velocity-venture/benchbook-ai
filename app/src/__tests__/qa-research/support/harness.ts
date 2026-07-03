// Shared harness for the qa-research suites (F5-04 / M1).
// Tests exercise the real route handler with constructor-injected mock
// deps (adapter, model, audit sink, environment); no vi.mock of the
// qa-research modules themselves. This file is a test-support addition
// relative to the F5-03 file map, recorded in 02_IMPLEMENTED_FILE_MAP.md.

import {
  createQaResearchHandler,
  type QaRouteDeps,
} from "../../../lib/qa-research/route-handler";
import { bootValidate, type BootReport } from "../../../lib/qa-research/environment";
import {
  createMockRetrievalAdapter,
  type MockAdapterOptions,
} from "../../../lib/qa-research/mock-retrieval-adapter";
import {
  createMockAuditLogger,
  type MockAuditLogger,
  type MockAuditLoggerOptions,
} from "../../../lib/qa-research/mock-audit-logger";
import {
  createMockModelClient,
  type ScriptedGenerationProfile,
} from "../../../lib/qa-research/mock-model-client";
import {
  createGuardrailService,
  type GuardrailServiceOptions,
} from "../../../lib/qa-research/guardrail";

export const TEST_AS_OF_DATE = "2026-07-02";

export function validBootReport(): BootReport {
  return bootValidate({
    QA_RESEARCH_TARGET: "mock_only",
    QA_RESEARCH_ENABLED: "true",
  });
}

export interface HarnessOptions {
  profile?: ScriptedGenerationProfile;
  adapterOptions?: MockAdapterOptions;
  auditOptions?: MockAuditLoggerOptions;
  guardrailOptions?: GuardrailServiceOptions;
  bootReport?: BootReport;
  depsOverride?: Partial<QaRouteDeps>;
}

export interface Harness {
  handler: (req: Request) => Promise<Response>;
  sink: MockAuditLogger;
}

let idSeq = 0;

export function buildHarness(options: HarnessOptions = {}): Harness {
  const sink = createMockAuditLogger(options.auditOptions);
  const handler = createQaResearchHandler({
    bootReport: options.bootReport ?? validBootReport(),
    adapter: createMockRetrievalAdapter(options.adapterOptions),
    modelClient: createMockModelClient(options.profile ?? "well_behaved"),
    auditLogger: sink,
    guardrail: createGuardrailService(options.guardrailOptions),
    accessCheck: async () => true,
    today: () => TEST_AS_OF_DATE,
    newId: (prefix: string) => {
      idSeq += 1;
      return `${prefix}-TEST-${String(idSeq).padStart(5, "0")}`;
    },
    ...options.depsOverride,
  });
  return { handler, sink };
}

export function qaRequest(body: unknown): Request {
  return new Request("http://localhost/api/qa-research", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Parsed SSE events are loosely typed on purpose: suites assert against
// scenario-specific envelope shapes field by field.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ParsedSse {
  events: Array<{ event: string; data: any }>;
  byName(name: string): any[];
  first(name: string): any;
  last(name: string): any;
}

export async function parseSse(res: Response): Promise<ParsedSse> {
  const text = await res.text();
  const events: Array<{ event: string; data: any }> = [];
  for (const block of text.split("\n\n")) {
    const eventMatch = block.match(/^event: (.+)$/m);
    const dataMatch = block.match(/^data: (.+)$/m);
    if (eventMatch && dataMatch) {
      events.push({ event: eventMatch[1], data: JSON.parse(dataMatch[1]) });
    }
  }
  return {
    events,
    byName: (name) => events.filter((e) => e.event === name).map((e) => e.data),
    first: (name) => events.find((e) => e.event === name)?.data,
    last: (name) => [...events].reverse().find((e) => e.event === name)?.data,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function runQuery(
  options: HarnessOptions,
  body: unknown
): Promise<{ sse: ParsedSse; res: Response; sink: MockAuditLogger }> {
  const { handler, sink } = buildHarness(options);
  const res = await handler(qaRequest(body));
  const sse = await parseSse(res);
  return { sse, res, sink };
}

export function auditKinds(sink: MockAuditLogger): string[] {
  return sink.entries().map((e) => e.kind);
}
