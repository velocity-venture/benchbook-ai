// T1 (F5-04 / M1): the six scenario JSONs under scenarios/ must be
// byte-identical (SHA-256) to the F5-02 mock-harness canon under
// docs/fable5-app-integration-readiness/mock-harness/. Editing either
// copy without syncing the other fails here, keeping the canon single.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCAL_DIR = resolve(HERE, "scenarios");
const CANON_DIR = resolve(
  HERE,
  "../../../..",
  "docs/fable5-app-integration-readiness/mock-harness"
);

const SCENARIO_FILES = [
  "mock_retrieval_scenarios.json",
  "mock_refusal_scenarios.json",
  "mock_citation_validation_scenarios.json",
  "mock_guardrail_scenarios.json",
  "mock_audit_log_scenarios.json",
  "mock_environment_target_scenarios.json",
];

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("scenario sync (local copies vs F5-02 canon)", () => {
  it.each(SCENARIO_FILES)("%s is checksum-identical to the canon", (name) => {
    const local = sha256File(resolve(LOCAL_DIR, name));
    const canon = sha256File(resolve(CANON_DIR, name));
    expect(local).toBe(canon);
  });

  it("covers all 57 canon scenarios", () => {
    let total = 0;
    for (const name of SCENARIO_FILES) {
      const doc = JSON.parse(readFileSync(resolve(LOCAL_DIR, name), "utf-8"));
      total += doc.scenarios.length;
    }
    expect(total).toBe(57);
  });
});
