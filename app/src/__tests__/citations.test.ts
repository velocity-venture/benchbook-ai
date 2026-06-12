import { describe, it, expect } from 'vitest';
import {
  buildCitationIndex,
  verifyCitations,
  computeConfidence,
} from '../lib/citation-validator';

// Minimal corpus samples for testing
const SAMPLE_TCA_37 = `
Title 37 Juveniles
37-1-101. Purpose — Jurisdiction.
(a) This chapter shall be liberally construed to the end that...
37-1-102. Definitions.
As used in this part: (1) "Child" means...
37-1-114. Criteria for detention of child.
(a) A child may be detained prior to adjudication only if:
(1) Detention is necessary to protect the child or others;
(2) There is reason to believe the child may flee;
§ 37-1-129. Disposition of delinquent child.
The court may make any disposition authorized under this chapter.
§ 37-1-130. Disposition of unruly child.
`;

const SAMPLE_TCA_36 = `
Title 36 Domestic Relations
§ 36-1-102. Definitions.
As used in this chapter: (1) "Abandonment" means...
36-6-106. Child custody factors.
In any custody proceeding the court shall consider...
`;

const SAMPLE_TRJPP = `
TENNESSEE RULES OF JUVENILE PRACTICE AND PROCEDURE
RULE 101: TITLE OF RULES
These rules shall be known as the TRJPP.
RULE 114: DETENTION HEARINGS
A detention hearing shall be held within 48 hours.
RULE 206: TRANSFER HEARINGS
Transfer to criminal court proceedings...
`;

const SAMPLE_DCS = `
=== DCS Policy: chap14-14.12.pdf ===
Policy 14.12: Investigation of Abuse and Neglect
The investigator shall document reasonable efforts...
Chapter 16: Foster Care Placement
Policy 16.7: Home Study Requirements
`;

describe('buildCitationIndex', () => {
  it('extracts TCA sections from corpus', () => {
    const index = buildCitationIndex(SAMPLE_TCA_37, SAMPLE_TCA_36);
    expect(index.tcaSections.has('37-1-101')).toBe(true);
    expect(index.tcaSections.has('37-1-114')).toBe(true);
    expect(index.tcaSections.has('37-1-129')).toBe(true);
    expect(index.tcaSections.has('36-1-102')).toBe(true);
    expect(index.tcaSections.has('36-6-106')).toBe(true);
  });

  it('extracts TRJPP rules from corpus', () => {
    const index = buildCitationIndex(undefined, undefined, SAMPLE_TRJPP);
    expect(index.trjppRules.has('101')).toBe(true);
    expect(index.trjppRules.has('114')).toBe(true);
    expect(index.trjppRules.has('206')).toBe(true);
  });

  it('extracts DCS policies from corpus', () => {
    const index = buildCitationIndex(undefined, undefined, undefined, SAMPLE_DCS);
    expect(index.dcsPolicies.has('14.12')).toBe(true);
    expect(index.dcsPolicies.has('16.7')).toBe(true);
  });

  it('stores snippets for extracted citations', () => {
    const index = buildCitationIndex(SAMPLE_TCA_37);
    expect(index.tcaSnippets.has('37-1-114')).toBe(true);
    expect(index.tcaSnippets.get('37-1-114')).toContain('detention');
  });
});

describe('verifyCitations', () => {
  const corpus = SAMPLE_TCA_37 + SAMPLE_TCA_36 + SAMPLE_TRJPP + SAMPLE_DCS;
  const index = buildCitationIndex(SAMPLE_TCA_37, SAMPLE_TCA_36, SAMPLE_TRJPP, SAMPLE_DCS);

  it('verifies known valid TCA citation', () => {
    const response = 'Under T.C.A. § 37-1-114, a child may be detained only if...';
    const citations = verifyCitations(response, index, corpus);
    const tca = citations.find(c => c.citation === 'T.C.A. § 37-1-114');
    expect(tca).toBeDefined();
    expect(tca!.verified).toBe(true);
    expect(tca!.snippet.length).toBeGreaterThan(0);
  });

  it('flags fabricated TCA citation as unverified', () => {
    const response = 'According to T.C.A. § 99-99-999, all judges must...';
    const citations = verifyCitations(response, index, corpus);
    const fake = citations.find(c => c.citation === 'T.C.A. § 99-99-999');
    expect(fake).toBeDefined();
    expect(fake!.verified).toBe(false);
    expect(fake!.snippet).toBe('');
  });

  it('handles TCA format variations', () => {
    const response = 'See TCA § 37-1-102 and T.C.A. section 36-1-102 for definitions.';
    const citations = verifyCitations(response, index, corpus);
    expect(citations.some(c => c.citation === 'T.C.A. § 37-1-102' && c.verified)).toBe(true);
    expect(citations.some(c => c.citation === 'T.C.A. § 36-1-102' && c.verified)).toBe(true);
  });

  it('handles Tenn. Code Ann. format', () => {
    const response = 'Pursuant to Tenn. Code Ann. § 37-1-102, a "child" means...';
    const citations = verifyCitations(response, index, corpus);
    const tca = citations.find(c => c.citation === 'T.C.A. § 37-1-102');
    expect(tca).toBeDefined();
    expect(tca!.verified).toBe(true);
  });

  it('matches all four TCA format variants', () => {
    const formats = [
      'T.C.A. § 37-1-102',
      'T.C.A. 37-1-102',
      'Tenn. Code Ann. § 37-1-102',
      'TCA 37-1-102',
    ];
    for (const fmt of formats) {
      const response = `See ${fmt} for the definition.`;
      const citations = verifyCitations(response, index, corpus);
      const tca = citations.find(c => c.citation === 'T.C.A. § 37-1-102');
      expect(tca, `Format "${fmt}" should be matched`).toBeDefined();
      expect(tca!.verified, `Format "${fmt}" should be verified`).toBe(true);
    }
  });

  it('handles subsection references like T.C.A. § 37-1-114(a)', () => {
    const response = 'Under T.C.A. § 37-1-114(a), detention requires...';
    const citations = verifyCitations(response, index, corpus);
    const tca = citations.find(c => c.citation === 'T.C.A. § 37-1-114');
    expect(tca).toBeDefined();
    expect(tca!.verified).toBe(true);
  });

  it('verifies TRJPP rule citations', () => {
    const response = 'TRJPP Rule 114 requires a detention hearing within 48 hours.';
    const citations = verifyCitations(response, index, corpus);
    const rule = citations.find(c => c.citation === 'TRJPP Rule 114');
    expect(rule).toBeDefined();
    expect(rule!.verified).toBe(true);
  });

  it('verifies DCS policy citations', () => {
    const response = 'DCS Policy 14.12 requires documentation of reasonable efforts.';
    const citations = verifyCitations(response, index, corpus);
    const dcs = citations.find(c => c.citation === 'DCS Policy 14.12');
    expect(dcs).toBeDefined();
    expect(dcs!.verified).toBe(true);
  });

  it('detects case law citations as unverified', () => {
    const response = 'In State of Tennessee v. Smith, the court held that...';
    const citations = verifyCitations(response, index, corpus);
    const caseCite = citations.find(c => c.type === 'CASELAW');
    expect(caseCite).toBeDefined();
    expect(caseCite!.verified).toBe(false);
    expect(caseCite!.snippet).toContain('cannot be verified');
  });

  it('deduplicates repeated citations', () => {
    const response = 'T.C.A. § 37-1-114 requires detention criteria. See T.C.A. § 37-1-114 again.';
    const citations = verifyCitations(response, index, corpus);
    const tcaCitations = citations.filter(c => c.citation === 'T.C.A. § 37-1-114');
    expect(tcaCitations).toHaveLength(1);
  });
});

describe('excluded-title cross-references', () => {
  // Realistic Title 37 text: the transfer statute cross-references
  // criminal-code sections from Titles 39, 40, and 55. Those references
  // appear in the corpus text but the sections themselves are not in
  // the V1 corpus and must never verify.
  const TCA_37_WITH_CROSS_REFS = `
Title 37 Juveniles
37-1-134. Transfer from juvenile court.
(a) The court may transfer the child if the child was charged with
conduct that would constitute rape of a child under § 39-13-522 if
committed by an adult, subject to sentencing under section 40-35-101.
Driving offenses are governed by § 55-10-401.
`;

  it('does not index excluded-title sections cross-referenced inside Title 37 text', () => {
    const index = buildCitationIndex(TCA_37_WITH_CROSS_REFS);
    expect(index.tcaSections.has('37-1-134')).toBe(true);
    expect(index.tcaSections.has('39-13-522')).toBe(false);
    expect(index.tcaSections.has('40-35-101')).toBe(false);
    expect(index.tcaSections.has('55-10-401')).toBe(false);
  });

  it('does not verify a T.C.A. § 39 citation as in-scope V1 authority', () => {
    const index = buildCitationIndex(TCA_37_WITH_CROSS_REFS);
    const response =
      'Transfer applies to rape of a child under T.C.A. § 39-13-522.';
    const citations = verifyCitations(response, index, TCA_37_WITH_CROSS_REFS);
    const cite = citations.find(c => c.citation === 'T.C.A. § 39-13-522');
    expect(cite).toBeDefined();
    expect(cite!.verified).toBe(false);
    expect(cite!.snippet).toBe('');
  });

  it('never verifies Title 39/40/55 citations even if the index contains them', () => {
    // Defense in depth: simulate a stale or externally built index that
    // already holds an excluded-title section.
    const index = buildCitationIndex(TCA_37_WITH_CROSS_REFS);
    index.tcaSections.add('40-35-101');
    const response = 'Sentencing follows T.C.A. § 40-35-101.';
    const citations = verifyCitations(response, index, TCA_37_WITH_CROSS_REFS);
    const cite = citations.find(c => c.citation === 'T.C.A. § 40-35-101');
    expect(cite).toBeDefined();
    expect(cite!.verified).toBe(false);
  });

  it('keeps in-scope Title 37 citations verified alongside cross-references', () => {
    const index = buildCitationIndex(TCA_37_WITH_CROSS_REFS);
    const response = 'Transfer is governed by T.C.A. § 37-1-134.';
    const citations = verifyCitations(response, index, TCA_37_WITH_CROSS_REFS);
    const cite = citations.find(c => c.citation === 'T.C.A. § 37-1-134');
    expect(cite).toBeDefined();
    expect(cite!.verified).toBe(true);
  });
});

describe('computeConfidence', () => {
  const corpus = SAMPLE_TCA_37 + SAMPLE_TRJPP;
  const index = buildCitationIndex(SAMPLE_TCA_37, undefined, SAMPLE_TRJPP);

  it('returns HIGH when all citations verified and no case law', () => {
    const response = 'Under T.C.A. § 37-1-114, detention is governed by...';
    const citations = verifyCitations(response, index, corpus);
    const confidence = computeConfidence(citations);
    expect(confidence.level).toBe('HIGH');
  });

  it('returns LOW when a statute citation is unverified', () => {
    const response = 'T.C.A. § 37-1-114 and T.C.A. § 99-99-999 both apply.';
    const citations = verifyCitations(response, index, corpus);
    const confidence = computeConfidence(citations);
    expect(confidence.level).toBe('LOW');
    expect(confidence.reason).toContain('99-99-999');
  });

  it('returns MEDIUM when case law is cited alongside verified statutes', () => {
    const response = 'T.C.A. § 37-1-114 applies. See also Smith v. Jones for guidance.';
    const citations = verifyCitations(response, index, corpus);
    const confidence = computeConfidence(citations);
    expect(confidence.level).toBe('MEDIUM');
  });

  it('returns LOW with no citations', () => {
    const confidence = computeConfidence([]);
    expect(confidence.level).toBe('LOW');
    expect(confidence.reason).toMatch(/No citations were provided/i);
  });
});
