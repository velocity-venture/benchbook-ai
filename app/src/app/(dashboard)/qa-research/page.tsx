"use client";

// QA Research workspace (F5-04 / M1). Internal QA surface over the
// mock-only route. This page is a pure renderer of the route's SSE
// events: banner, target chip, answer with citation cards, reference
// material section, refusal panel, and audit trace line. It performs no
// data access of its own and has no external client imports.

import { useRef, useState } from "react";

interface EnvironmentEventData {
  target: string;
  label: string;
  banner: string;
  tier: string;
  no_production_notice: string;
  fixture_manifest_sha256: string | null;
  as_of_date: string;
}

interface CitationCard {
  canonical_citation: string;
  source_family: string;
  scope_tag: string;
  page_start: number;
  page_end: number;
  effectivity: { effective_label: string; as_of_date_used: string };
  verification: { level: string };
  qa_signoff_status: string;
  environment_tier: string;
  granularity_clamped: boolean;
  reference_tag?: string;
}

interface RefusalData {
  refusal_kind: string;
  refusal_variant: string;
  user_message_title: string;
  user_message: string;
  permissible_help: string[];
  audit: { refusal_record_id: string | null };
}

interface DoneData {
  response_class: string;
  request_id: string;
  audit: {
    retrieval_log_id: string | null;
    answer_audit_record_id: string | null;
    refusal_record_id: string | null;
    citation_verification_record_count: number;
  };
}

interface QaResult {
  environment: EnvironmentEventData | null;
  answerText: string;
  citations: CitationCard[];
  referenceMaterial: CitationCard[];
  warnings: Array<{ claim: string; level: string }>;
  refusal: RefusalData | null;
  confidence: { value: string; note: string } | null;
  done: DoneData | null;
}

function emptyResult(): QaResult {
  return {
    environment: null,
    answerText: "",
    citations: [],
    referenceMaterial: [],
    warnings: [],
    refusal: null,
    confidence: null,
    done: null,
  };
}

function parseSseText(text: string): Array<{ event: string; data: unknown }> {
  const events: Array<{ event: string; data: unknown }> = [];
  for (const block of text.split("\n\n")) {
    const eventMatch = block.match(/^event: (.+)$/m);
    const dataMatch = block.match(/^data: (.+)$/m);
    if (eventMatch && dataMatch) {
      try {
        events.push({ event: eventMatch[1], data: JSON.parse(dataMatch[1]) });
      } catch {
        // Malformed event blocks are dropped; the page renders only
        // well-formed envelope events.
      }
    }
  }
  return events;
}

function verificationBadge(level: string): string {
  if (level === "verified_retrieved") return "verified";
  if (level === "verified_resolved") return "resolved";
  return level;
}

function CitationCardView({ card }: { card: CitationCard }) {
  return (
    <div className="border border-slate-700 rounded-lg p-3 bg-slate-900 text-sm space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-amber-300">{card.canonical_citation}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600">
          {verificationBadge(card.verification.level)}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        family: {card.source_family} | scope: {card.scope_tag} | pages{" "}
        {card.page_start}-{card.page_end}
        {card.granularity_clamped ? " | granularity clamped to parent section" : ""}
      </p>
      <p className="text-xs text-slate-500">
        {card.effectivity.effective_label} | as of {card.effectivity.as_of_date_used} | QA:{" "}
        {card.qa_signoff_status} | tier: {card.environment_tier}
      </p>
      {card.scope_tag === "evidentiary" && (
        <p className="text-xs text-sky-300">
          TRE limited scope: evidentiary and procedural use only.
        </p>
      )}
      {card.reference_tag && (
        <p className="text-xs text-orange-300">
          DCS reference only: {card.reference_tag.replaceAll("_", " ")}.
        </p>
      )}
    </div>
  );
}

export default function QaResearchPage() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [result, setResult] = useState<QaResult>(emptyResult());
  const environmentRef = useRef<EnvironmentEventData | null>(null);

  async function submit() {
    if (!query.trim() || busy) return;
    setBusy(true);
    setUnavailable(null);
    const next = emptyResult();
    try {
      const res = await fetch("/api/qa-research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      if (res.status === 503) {
        setUnavailable(
          "The QA research route is unavailable: environment validation failed."
        );
        setResult(next);
        return;
      }
      if (!res.ok && res.headers.get("content-type")?.includes("json")) {
        const body = await res.json();
        next.refusal = body.refusal ?? null;
        setResult(next);
        return;
      }
      const text = await res.text();
      for (const { event, data } of parseSseText(text)) {
        if (event === "environment") {
          next.environment = data as EnvironmentEventData;
          environmentRef.current = next.environment;
        } else if (event === "delta") {
          next.answerText += (data as { text: string }).text;
        } else if (event === "citations") {
          const payload = data as {
            citations: CitationCard[];
            reference_material: CitationCard[];
            warnings: Array<{ claim: string; level: string }>;
          };
          next.citations = payload.citations;
          next.referenceMaterial = payload.reference_material ?? [];
          next.warnings = payload.warnings ?? [];
        } else if (event === "refusal") {
          next.refusal = data as RefusalData;
        } else if (event === "confidence") {
          next.confidence = data as { value: string; note: string };
        } else if (event === "done") {
          next.done = data as DoneData;
        }
      }
      // Defensive citation-required rule (doc 07): answer text renders
      // only when at least one verified citation arrived; otherwise the
      // refusal presentation wins even if delta text slipped through.
      if (next.citations.length === 0 && !next.refusal) {
        next.answerText = "";
      }
      setResult(next);
    } catch {
      setUnavailable("The request failed before any envelope arrived.");
      setResult(next);
    } finally {
      setBusy(false);
    }
  }

  const environment = result.environment ?? environmentRef.current;
  const showAnswer =
    !result.refusal && result.answerText.length > 0 && result.citations.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Environment banner: always visible; absence is stop condition SC-7 */}
      <div className="bg-red-900/60 border border-red-500 text-red-100 text-center font-semibold rounded-lg px-4 py-2">
        {environment ? environment.banner : "MOCK ONLY - SYNTHETIC DATA - NOT FOR JUDICIAL RELIANCE"}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">QA Research (internal)</h1>
        <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-600 text-amber-300">
          {environment ? environment.label : "MOCK_ONLY"}
          {environment?.fixture_manifest_sha256
            ? ` | fixtures ${environment.fixture_manifest_sha256.slice(0, 8)}`
            : ""}
          {environment ? ` | as of ${environment.as_of_date}` : ""}
        </span>
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white"
          rows={3}
          placeholder="Ask a research question against the SYNTHETIC mock corpus"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={submit}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-medium disabled:opacity-50"
        >
          {busy ? "Running" : "Run"}
        </button>
      </div>

      {unavailable && (
        <div className="border border-slate-600 rounded-lg p-4 text-slate-300 text-sm">
          {unavailable}
        </div>
      )}

      {result.refusal && (
        <div
          role="alert"
          aria-label="refusal panel"
          className="border border-orange-500 bg-orange-950/40 rounded-lg p-4 space-y-2"
        >
          <p className="font-semibold text-orange-200">
            {result.refusal.user_message_title}
          </p>
          <p className="text-sm text-orange-100">{result.refusal.user_message}</p>
          <p className="text-xs text-orange-300">
            This is a refusal, not a legal answer. Permissible help:{" "}
            {result.refusal.permissible_help.join(", ").replaceAll("_", " ")}
          </p>
          <p className="text-xs text-slate-400">
            Trace: refusal {result.refusal.audit.refusal_record_id ?? "n/a"}
          </p>
        </div>
      )}

      {showAnswer && (
        <div className="space-y-3">
          <div className="border border-slate-700 rounded-lg p-4 bg-slate-900">
            <p className="text-sm text-slate-100 whitespace-pre-wrap">{result.answerText}</p>
            {result.confidence && (
              <p className="text-xs text-slate-400 mt-2">
                Confidence: {result.confidence.value} ({result.confidence.note})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300">Supporting authority</h2>
            {result.citations.map((c) => (
              <CitationCardView key={c.canonical_citation} card={c} />
            ))}
          </div>

          {result.warnings.length > 0 && (
            <div className="border border-yellow-600 rounded-lg p-3 text-xs text-yellow-200">
              Unverified citation claims (not rendered as citations):{" "}
              {result.warnings.map((w) => w.claim).join(", ")}
            </div>
          )}
        </div>
      )}

      {result.referenceMaterial.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-orange-300">
            Reference material (not controlling authority)
          </h2>
          <p className="text-xs text-slate-400">
            DCS policy material is guardrail reference only; it is never legal
            authority for a ruling.
          </p>
          {result.referenceMaterial.map((c) => (
            <CitationCardView key={c.canonical_citation} card={c} />
          ))}
        </div>
      )}

      {result.done && (
        <p className="text-xs text-slate-500">
          Trace: request {result.done.request_id} | retrieval{" "}
          {result.done.audit.retrieval_log_id ?? "n/a"} | answer{" "}
          {result.done.audit.answer_audit_record_id ?? "n/a"} | citations verified{" "}
          {result.done.audit.citation_verification_record_count}
        </p>
      )}

      {/* Static no-production footer (environment module constant text) */}
      <p className="text-xs text-slate-600 border-t border-slate-800 pt-3">
        {environment
          ? environment.no_production_notice
          : "This build cannot connect to production. All material shown is synthetic."}
      </p>
    </div>
  );
}
