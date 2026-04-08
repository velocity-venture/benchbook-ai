/**
 * Hallucination Prevention Guard for BenchBook.AI
 *
 * A judge making a ruling based on a hallucinated statute is a catastrophic failure.
 * This module provides a safety layer between Claude's output and what the judge sees.
 */

import {
  type CitationIndex,
  type VerifiedCitation,
  type ConfidenceLevel,
  verifyCitations,
  computeConfidence,
} from './citation-validator';

export interface HallucinationGuardResult {
  confidence: ConfidenceLevel;
  confidenceReason: string;
  citations: VerifiedCitation[];
  warnings: string[];
}

/**
 * Run the hallucination guard on a Claude response.
 * Verifies all citations and flags potential issues.
 */
export function runHallucinationGuard(
  responseText: string,
  citationIndex: CitationIndex,
  corpusText: string
): HallucinationGuardResult {
  const citations = verifyCitations(responseText, citationIndex, corpusText);
  const { level: confidence, reason: confidenceReason } = computeConfidence(citations);
  const warnings: string[] = [];

  // Flag unverified statutes
  const unverifiedStatutes = citations.filter(
    c => c.type !== 'CASELAW' && !c.verified
  );
  for (const cite of unverifiedStatutes) {
    warnings.push(
      `⚠ ${cite.citation} could not be verified against the loaded legal corpus. Do not rely on this citation without independent verification.`
    );
  }

  // Flag case law citations
  const caseLawCitations = citations.filter(c => c.type === 'CASELAW');
  if (caseLawCitations.length > 0) {
    warnings.push(
      'Case law citations cannot be verified by BenchBook. Confirm independently via Westlaw or LexisNexis before relying on these references.'
    );
  }

  return {
    confidence,
    confidenceReason,
    citations,
    warnings,
  };
}

/**
 * System prompt guardrails to prepend to Claude's instructions.
 * These reduce hallucination at the source.
 */
export const HALLUCINATION_GUARDRAILS = `
CRITICAL ACCURACY REQUIREMENTS:
- Only cite Tennessee statutes (TCA), TRJPP rules, and DCS policies that appear in the provided corpus context.
- If you are unsure whether a statute section exists, say so explicitly. Do not guess.
- Do not fabricate case law. If asked about case law, state that case law lookup is not yet available and recommend Westlaw or LexisNexis.
- Always use the format T.C.A. § [title]-[chapter]-[section] when citing statutes.
- If a question falls outside the provided legal corpus, clearly state: "This topic is not covered in the currently loaded legal corpus."
- Never extrapolate statute numbers. If you know Title 37, Chapter 1 exists but are unsure of a specific section number, do not invent one.
`.trim();
