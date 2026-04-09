import { describe, it, expect } from 'vitest';
import { buildCitationIndex } from '../lib/citation-validator';
import { runHallucinationGuard, HALLUCINATION_GUARDRAILS } from '../lib/hallucination-guard';

const SAMPLE_CORPUS = `
§ 37-1-114. Criteria for detention of child.
(a) A child may be detained prior to adjudication only if detention is necessary.
§ 37-1-129. Disposition of delinquent child.
The court may make any disposition authorized under this chapter.
RULE 101: TITLE OF RULES
RULE 114: DETENTION HEARINGS
`;

const index = buildCitationIndex(SAMPLE_CORPUS, undefined, SAMPLE_CORPUS);

describe('runHallucinationGuard', () => {
  it('returns HIGH confidence for response with only valid corpus citations', () => {
    const response = 'Under T.C.A. § 37-1-114, a child may be detained only if criteria are met.';
    const result = runHallucinationGuard(response, index, SAMPLE_CORPUS);
    expect(result.confidence).toBe('HIGH');
    expect(result.warnings).toHaveLength(0);
  });

  it('returns LOW confidence for fabricated statute', () => {
    const response = 'T.C.A. § 37-1-114 applies here. Also see T.C.A. § 42-5-999 for additional guidance.';
    const result = runHallucinationGuard(response, index, SAMPLE_CORPUS);
    expect(result.confidence).toBe('LOW');
    expect(result.warnings.some(w => w.includes('42-5-999'))).toBe(true);
  });

  it('returns MEDIUM confidence when case law is mentioned with verified statutes', () => {
    const response = 'T.C.A. § 37-1-114 governs detention. See also Smith v. Jones for precedent.';
    const result = runHallucinationGuard(response, index, SAMPLE_CORPUS);
    expect(result.confidence).toBe('MEDIUM');
    expect(result.warnings.some(w => w.includes('Westlaw'))).toBe(true);
  });

  it('includes all verified and unverified citations', () => {
    const response = 'T.C.A. § 37-1-114 and T.C.A. § 99-1-999 both apply.';
    const result = runHallucinationGuard(response, index, SAMPLE_CORPUS);
    expect(result.citations).toHaveLength(2);
    expect(result.citations.find(c => c.citation === 'T.C.A. § 37-1-114')?.verified).toBe(true);
    expect(result.citations.find(c => c.citation === 'T.C.A. § 99-1-999')?.verified).toBe(false);
  });
});

describe('HALLUCINATION_GUARDRAILS', () => {
  it('includes key safety instructions', () => {
    expect(HALLUCINATION_GUARDRAILS).toContain('Do not fabricate case law');
    expect(HALLUCINATION_GUARDRAILS).toContain('T.C.A. §');
    expect(HALLUCINATION_GUARDRAILS).toContain('Westlaw');
    expect(HALLUCINATION_GUARDRAILS).toContain('Do not guess');
  });
});
