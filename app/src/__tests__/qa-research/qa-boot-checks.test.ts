// T9 (F5-04 / M1): bootValidate matrix (ME-06 shapes). Missing target,
// unknown target, production sentinel, bad model ids, and the excerpt
// flag default are all decided at boot, before any request work.

import { describe, expect, it } from "vitest";
import { bootValidate, resolveTarget } from "../../lib/qa-research/environment";
import { TargetNotAvailableError } from "../../lib/qa-research/types";

describe("bootValidate matrix", () => {
  it("flag off (or absent) makes the route unavailable", () => {
    for (const enabled of [undefined, "false", "TRUE", "1", "yes"]) {
      const report = bootValidate({
        QA_RESEARCH_TARGET: "mock_only",
        QA_RESEARCH_ENABLED: enabled,
      });
      expect(report.ok).toBe(false);
      expect(report.mode).toBe("unavailable");
    }
  });

  it("missing target fails fast with a named variable", () => {
    const report = bootValidate({ QA_RESEARCH_ENABLED: "true" });
    expect(report.ok).toBe(false);
    expect(report.mode).toBe("unavailable");
    expect(report.alerts.join(" ")).toContain("QA_RESEARCH_TARGET");
  });

  it("unknown target is not in the M1 registry", () => {
    const report = bootValidate({
      QA_RESEARCH_TARGET: "preview_internal_qa",
      QA_RESEARCH_ENABLED: "true",
    });
    expect(report.ok).toBe(false);
    expect(report.mode).toBe("unavailable");
  });

  it("production sentinel gets the loud refuse-everything posture (ME-04)", () => {
    for (const value of ["production_prohibited", "production", "prod-east"]) {
      const report = bootValidate({
        QA_RESEARCH_TARGET: value,
        QA_RESEARCH_ENABLED: "true",
      });
      expect(report.ok).toBe(false);
      expect(report.mode).toBe("refuse_target_control");
      expect(report.alerts.join(" ")).toContain("QA_RESEARCH_TARGET");
    }
  });

  it("invalid model id fails boot, not the first request", () => {
    const report = bootValidate({
      QA_RESEARCH_TARGET: "mock_only",
      QA_RESEARCH_ENABLED: "true",
      QA_RESEARCH_MODEL: "claude-3-5-sonnet-20241022!!",
    });
    expect(report.ok).toBe(false);
    expect(report.alerts.join(" ")).toContain("QA_RESEARCH_MODEL");
  });

  it("excerpt logging defaults off and only 'true' enables it", () => {
    const off = bootValidate({
      QA_RESEARCH_TARGET: "mock_only",
      QA_RESEARCH_ENABLED: "true",
      QA_MODE_EXCERPT_LOGGING: "yes",
    });
    expect(off.ok).toBe(true);
    expect(off.environment?.excerptLogging).toBe(false);

    const on = bootValidate({
      QA_RESEARCH_TARGET: "mock_only",
      QA_RESEARCH_ENABLED: "true",
      QA_MODE_EXCERPT_LOGGING: "true",
    });
    expect(on.ok).toBe(true);
    expect(on.environment?.excerptLogging).toBe(true);
    expect(on.alerts.join(" ")).toContain("QA_MODE_EXCERPT_LOGGING");
  });

  it("valid boot pins mock_only with the MOCK_ONLY label", () => {
    const report = bootValidate({
      QA_RESEARCH_TARGET: "mock_only",
      QA_RESEARCH_ENABLED: "true",
    });
    expect(report.ok).toBe(true);
    expect(report.environment?.target).toBe("mock_only");
    expect(report.environment?.label).toBe("MOCK_ONLY");
  });

  it("resolveTarget throws TargetNotAvailableError on anything but mock_only", () => {
    expect(resolveTarget("mock_only")).toBe("mock_only");
    for (const bad of [undefined, "", "preview_internal_qa", "production_prohibited"]) {
      expect(() => resolveTarget(bad)).toThrow(TargetNotAvailableError);
    }
  });

  it("echo assertion refuses a mismatched response target (SC-1)", () => {
    const report = bootValidate({
      QA_RESEARCH_TARGET: "mock_only",
      QA_RESEARCH_ENABLED: "true",
    });
    expect(() => report.environment?.assertEcho("mock_only")).not.toThrow();
    expect(() => report.environment?.assertEcho("preview_internal_qa")).toThrow(
      TargetNotAvailableError
    );
  });
});
