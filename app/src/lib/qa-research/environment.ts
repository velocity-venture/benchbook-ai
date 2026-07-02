// Environment target control for the mock-only QA research path (F5-04 / M1).
// Fail-fast named-variable validation follows the pattern of
// the existing platform env module. No database endpoint, project ref, or credential is
// read or accepted here; the M1 registry contains exactly one target.

import {
  ENVIRONMENT_LABEL,
  EnvironmentValidationError,
  MOCK_ONLY_TARGET,
  TargetNotAvailableError,
  type EnvironmentTarget,
} from "./types";

export interface QaEnvRecord {
  QA_RESEARCH_TARGET?: string;
  QA_RESEARCH_ENABLED?: string;
  QA_MODE_EXCERPT_LOGGING?: string;
  QA_RESEARCH_MODEL?: string;
}

export interface QaEnvironment {
  target: EnvironmentTarget;
  label: string;
  enabled: boolean;
  excerptLogging: boolean;
  modelName: string;
  productionSentinel: boolean;
  bootAlerts: string[];
  assertEcho(responseTarget: string): void;
}

// The always-refuse sentinel from the F5-02 request contract. It is not a
// member of the target enum; it is recognized only to refuse loudly with
// variant target_control instead of a generic boot failure.
export const PRODUCTION_SENTINEL = "production_prohibited";

// Model id allowlist for the mock path. M1 never calls a real model; the
// name is recorded in audit entries only. The pattern rejects the invalid
// dated-suffix ids that caused defect D1 on the legacy route.
const MODEL_ID_PATTERN = /^claude-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_MODEL_NAME = "claude-mock-scripted";

function isProductionShaped(value: string): boolean {
  return value === PRODUCTION_SENTINEL || /prod/i.test(value);
}

export function resolveTarget(raw: string | undefined): EnvironmentTarget {
  if (raw !== MOCK_ONLY_TARGET) {
    throw new TargetNotAvailableError(raw ?? "(unset)");
  }
  return MOCK_ONLY_TARGET;
}

export interface BootReport {
  ok: boolean;
  mode: "available" | "unavailable" | "refuse_target_control";
  alerts: string[];
  environment: QaEnvironment | null;
}

export function bootValidate(env: QaEnvRecord): BootReport {
  const alerts: string[] = [];

  const enabledRaw = env.QA_RESEARCH_ENABLED;
  if (enabledRaw !== "true") {
    return {
      ok: false,
      mode: "unavailable",
      alerts: ["QA_RESEARCH_ENABLED is not 'true'; the QA research route is disabled"],
      environment: null,
    };
  }

  const targetRaw = env.QA_RESEARCH_TARGET;
  if (targetRaw === undefined || targetRaw === "") {
    return {
      ok: false,
      mode: "unavailable",
      alerts: ["QA_RESEARCH_TARGET is missing; set it to 'mock_only' for M1"],
      environment: null,
    };
  }

  // Production-shaped values get the loud always-refuse posture (ME-04)
  // rather than a silent unavailable, so misconfiguration is visible.
  if (isProductionShaped(targetRaw)) {
    return {
      ok: false,
      mode: "refuse_target_control",
      alerts: [
        `QA_RESEARCH_TARGET value is production-shaped and permanently refused in M1 (variable: QA_RESEARCH_TARGET)`,
      ],
      environment: null,
    };
  }

  if (targetRaw !== MOCK_ONLY_TARGET) {
    return {
      ok: false,
      mode: "unavailable",
      alerts: [
        `QA_RESEARCH_TARGET value is not in the M1 registry; only 'mock_only' is available (variable: QA_RESEARCH_TARGET)`,
      ],
      environment: null,
    };
  }

  const modelName = env.QA_RESEARCH_MODEL ?? DEFAULT_MODEL_NAME;
  if (!MODEL_ID_PATTERN.test(modelName)) {
    return {
      ok: false,
      mode: "unavailable",
      alerts: [
        `QA_RESEARCH_MODEL does not match the model id allowlist pattern (variable: QA_RESEARCH_MODEL)`,
      ],
      environment: null,
    };
  }

  const excerptRaw = env.QA_MODE_EXCERPT_LOGGING;
  const excerptLogging = excerptRaw === "true";
  if (excerptLogging) {
    alerts.push(
      "QA_MODE_EXCERPT_LOGGING is enabled; excerpt fields carry the purge-first marker (owner default is off, P5)"
    );
  }

  const environment: QaEnvironment = {
    target: MOCK_ONLY_TARGET,
    label: ENVIRONMENT_LABEL,
    enabled: true,
    excerptLogging,
    modelName,
    productionSentinel: false,
    bootAlerts: alerts,
    assertEcho(responseTarget: string) {
      if (responseTarget !== MOCK_ONLY_TARGET) {
        throw new TargetNotAvailableError(responseTarget);
      }
    },
  };

  return { ok: true, mode: "available", alerts, environment };
}

export function bootValidateOrThrow(env: QaEnvRecord): QaEnvironment {
  const report = bootValidate(env);
  if (!report.ok || report.environment === null) {
    throw new EnvironmentValidationError(report.alerts.join("; "), [
      "QA_RESEARCH_TARGET",
      "QA_RESEARCH_ENABLED",
    ]);
  }
  return report.environment;
}

export function readProcessEnv(): QaEnvRecord {
  return {
    QA_RESEARCH_TARGET: process.env.QA_RESEARCH_TARGET,
    QA_RESEARCH_ENABLED: process.env.QA_RESEARCH_ENABLED,
    QA_MODE_EXCERPT_LOGGING: process.env.QA_MODE_EXCERPT_LOGGING,
    QA_RESEARCH_MODEL: process.env.QA_RESEARCH_MODEL,
  };
}
