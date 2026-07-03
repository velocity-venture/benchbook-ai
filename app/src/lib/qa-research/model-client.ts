// ModelClient interface for the QA research path (F5-04 / M1).
// M1 deliberately contains NO live model binding: the registry maps the
// mock_only target to the scripted mock client, so the qa-research module
// graph has no network path at all. A real provider binding arrives with
// a later phase under its own review, behind this same interface.

import { TargetNotAvailableError } from "./types";
import type { PromptPackage } from "./prompt-contract";
import {
  createMockModelClient,
  type ScriptedGenerationProfile,
} from "./mock-model-client";

export interface GenerationResult {
  text: string;
  model_name: string;
  stop_reason: "end_turn" | "error";
  called: boolean;
}

export interface ModelClient {
  streamAnswer(
    prompt: PromptPackage,
    onDelta: (delta: string) => void
  ): Promise<GenerationResult>;
}

type ModelFactory = (profile?: ScriptedGenerationProfile) => ModelClient;

const M1_MODEL_REGISTRY: Record<"mock_only", ModelFactory> = {
  mock_only: (profile) => createMockModelClient(profile ?? "well_behaved"),
};

export function createModelClient(
  target: string,
  profile?: ScriptedGenerationProfile
): ModelClient {
  const factory = M1_MODEL_REGISTRY[target as "mock_only"];
  if (!factory) {
    throw new TargetNotAvailableError(target);
  }
  return factory(profile);
}
