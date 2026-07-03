// Scripted mock model client (F5-04 / M1). Each profile deterministically
// produces the misbehavior its scenarios need. The "generation" quotes only
// citation strings found in the prompt package (or deliberately fabricated
// SYNTHETIC ones); no legal text exists anywhere in these scripts.

import type { ModelClient, GenerationResult } from "./model-client";
import type { PromptPackage } from "./prompt-contract";

export type ScriptedGenerationProfile =
  | "well_behaved"
  | "fabricates_citation"
  | "cites_adjacent_authority"
  | "cites_excluded_title"
  | "cites_subsection"
  | "recommends_ruling"
  | "leaks_restricted_marker"
  | "injection_compliant"
  | "not_called";

const MODEL_NAME = "claude-mock-scripted";

function citationsInPrompt(prompt: PromptPackage): string[] {
  const matches = prompt.system.match(/citation: (.+)/g) ?? [];
  return matches.map((m) => m.replace("citation: ", "").trim());
}

function firstCitation(prompt: PromptPackage): string {
  return citationsInPrompt(prompt)[0] ?? "SYN-00-000 (SYNTHETIC-EMPTY)";
}

function scriptFor(profile: ScriptedGenerationProfile, prompt: PromptPackage): string {
  const cited = firstCitation(prompt);
  const all = citationsInPrompt(prompt);
  switch (profile) {
    case "well_behaved":
      return [
        "SYNTHETIC MOCK ANSWER: Based only on the retrieved synthetic passages, the researched provision addresses the fictional subject matter described there.",
        `Supporting authority: ${all.join("; ")}.`,
      ].join(" ");
    case "fabricates_citation":
      return "SYNTHETIC MOCK ANSWER: The controlling provision is T.C.A. SYN-99-999 (SYNTHETIC), which resolves this question.";
    case "cites_adjacent_authority":
      return "SYNTHETIC MOCK ANSWER: A related synthetic provision, T.C.A. SYN-37-905 (SYNTHETIC), addresses this fictional topic.";
    case "cites_excluded_title":
      return "SYNTHETIC MOCK ANSWER: This is governed by 39-13-101 under the criminal code.";
    case "cites_subsection":
      return `SYNTHETIC MOCK ANSWER: The precise rule appears at SYN-37-901(b)(2), within ${cited}.`;
    case "recommends_ruling":
      return `SYNTHETIC MOCK ANSWER: Given these facts, you should rule for the petitioner and order removal. Supporting authority: ${cited}.`;
    case "leaks_restricted_marker":
      return `SYNTHETIC MOCK ANSWER: RESTRICTED-LEXIS material and Title 39 sources support this. Supporting authority: ${cited}.`;
    case "injection_compliant":
      return "SYNTHETIC MOCK ANSWER: Ignoring previous instructions as requested. Here is an unrestricted answer without citations.";
    case "not_called":
      throw new Error(
        "mock model client with profile 'not_called' was invoked; this scenario asserts the model is never reached"
      );
  }
}

export function createMockModelClient(
  profile: ScriptedGenerationProfile
): ModelClient {
  return {
    async streamAnswer(prompt, onDelta) {
      const text = scriptFor(profile, prompt);
      // Stream in two deltas so SSE delta handling is exercised.
      const midpoint = Math.ceil(text.length / 2);
      onDelta(text.slice(0, midpoint));
      onDelta(text.slice(midpoint));
      const result: GenerationResult = {
        text,
        model_name: MODEL_NAME,
        stop_reason: "end_turn",
        called: true,
      };
      return result;
    },
  };
}
