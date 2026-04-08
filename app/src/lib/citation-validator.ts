/**
 * Citation Validation Engine for BenchBook.AI
 *
 * Builds an index of real legal citations from the loaded corpus,
 * then verifies citations in AI responses against that index.
 * A judge cannot rely on unverified citations — this is the safety net.
 */

export interface CitationIndex {
  tcaSections: Set<string>;   // e.g. "37-1-114", "36-1-102"
  trjppRules: Set<string>;    // e.g. "101", "206"
  dcsPolicies: Set<string>;   // e.g. "14.12", "16.7"
  // Map section numbers to their surrounding text for snippet extraction
  tcaSnippets: Map<string, string>;
  trjppSnippets: Map<string, string>;
  dcsSnippets: Map<string, string>;
}

export interface VerifiedCitation {
  title: string;
  citation: string;
  type: "TCA" | "DCS" | "TRJPP" | "LOCAL" | "CASELAW";
  verified: boolean;
  snippet: string;
  sourceFile?: string;
}

/**
 * Build an index of all citations that actually exist in the corpus.
 */
export function buildCitationIndex(
  tcaText37?: string,
  tcaText36?: string,
  trjppText?: string,
  dcsText?: string
): CitationIndex {
  const tcaSections = new Set<string>();
  const trjppRules = new Set<string>();
  const dcsPolicies = new Set<string>();
  const tcaSnippets = new Map<string, string>();
  const trjppSnippets = new Map<string, string>();
  const dcsSnippets = new Map<string, string>();

  // Extract TCA section numbers from corpus text
  // Matches: "37-1-114", "§ 37-1-114", "section 37-1-114"
  const tcaPattern = /(?:section|§)\s*(\d+-\d+-\d+)/gi;
  // Also match bare section numbers in statute format at start of lines
  const tcaBarePattern = /^(\d+-\d+-\d+)\.\s/gm;

  for (const text of [tcaText37, tcaText36]) {
    if (!text) continue;

    let match;
    const pattern1 = new RegExp(tcaPattern.source, tcaPattern.flags);
    while ((match = pattern1.exec(text)) !== null) {
      const section = match[1];
      tcaSections.add(section);
      if (!tcaSnippets.has(section)) {
        const start = Math.max(0, match.index);
        const end = Math.min(text.length, match.index + 300);
        tcaSnippets.set(section, text.slice(start, end).trim());
      }
    }

    const pattern2 = new RegExp(tcaBarePattern.source, tcaBarePattern.flags);
    while ((match = pattern2.exec(text)) !== null) {
      const section = match[1];
      tcaSections.add(section);
      if (!tcaSnippets.has(section)) {
        const start = Math.max(0, match.index);
        const end = Math.min(text.length, match.index + 300);
        tcaSnippets.set(section, text.slice(start, end).trim());
      }
    }
  }

  // Extract TRJPP rule numbers
  if (trjppText) {
    const rulePattern = /RULE\s+(\d+)/gi;
    let match;
    while ((match = rulePattern.exec(trjppText)) !== null) {
      const ruleNum = match[1];
      trjppRules.add(ruleNum);
      if (!trjppSnippets.has(ruleNum)) {
        const start = Math.max(0, match.index);
        const end = Math.min(trjppText.length, match.index + 300);
        trjppSnippets.set(ruleNum, trjppText.slice(start, end).trim());
      }
    }
  }

  // Extract DCS policy numbers
  if (dcsText) {
    const policyPattern = /(?:policy|chapter|chap)\s*(\d+(?:\.\d+)?)/gi;
    let match;
    while ((match = policyPattern.exec(dcsText)) !== null) {
      const policyNum = match[1];
      dcsPolicies.add(policyNum);
      if (!dcsSnippets.has(policyNum)) {
        const start = Math.max(0, match.index);
        const end = Math.min(dcsText.length, match.index + 300);
        dcsSnippets.set(policyNum, dcsText.slice(start, end).trim());
      }
    }
    // From section headers: "=== DCS Policy: chap14-14.12.pdf ==="
    const fileHeaderPattern = /DCS Policy: chap\d+-(\d+\.\d+)\.pdf/g;
    while ((match = fileHeaderPattern.exec(dcsText)) !== null) {
      dcsPolicies.add(match[1]);
    }
  }

  return { tcaSections, trjppRules, dcsPolicies, tcaSnippets, trjppSnippets, dcsSnippets };
}

/**
 * TCA citation patterns — handles format variations judges might see:
 *   T.C.A. § 37-1-114
 *   T.C.A. section 37-1-114
 *   TCA § 37-1-114
 *   TCA 37-1-114
 *   T.C.A. §37-1-114(a)
 */
const TCA_PATTERN = /T\.?C\.?A\.?\s*§?\s*(?:section\s+)?(\d+-\d+-\d+)(?:\([a-z0-9]+\))?/gi;

/**
 * TRJPP rule patterns:
 *   TRJPP Rule 114
 *   Rule 206
 *   TRJPP 101
 */
const TRJPP_PATTERN = /(?:TRJPP\s+)?Rule\s+(\d+)/gi;

/**
 * DCS policy patterns:
 *   DCS Policy 14.12
 *   DCS policy 16.7
 */
const DCS_PATTERN = /DCS\s+Policy\s+([0-9.]+)/gi;

/**
 * Case law patterns — detect case citations that we cannot verify
 *   Smith v. Jones
 *   In re Smith
 *   State of Tennessee v. Jones
 *   123 S.W.2d 456
 *   123 S.W.3d 456
 */
const CASE_LAW_PATTERNS = [
  /\b[A-Z][a-z]+\s+v\.\s+[A-Z][a-z]+/g,
  /\bIn\s+re\s+[A-Z][a-z]+/g,
  /\bState\s+(?:of\s+Tennessee\s+)?v\.\s+[A-Z][a-z]+/g,
  /\b\d+\s+S\.W\.\d[d]\s+\d+/g,
  /\b\d+\s+Tenn\.\s+\d+/g,
  /\b\d+\s+Tenn\.App\.\s+\d+/g,
];

/**
 * Extract citations from an AI response and verify each against the corpus index.
 */
export function verifyCitations(
  responseText: string,
  index: CitationIndex,
  corpusText: string
): VerifiedCitation[] {
  const citations: VerifiedCitation[] = [];
  const seen = new Set<string>();

  // Extract and verify TCA citations
  const tcaRegex = new RegExp(TCA_PATTERN.source, TCA_PATTERN.flags);
  let match;
  while ((match = tcaRegex.exec(responseText)) !== null) {
    const sectionNum = match[1];
    const key = `TCA-${sectionNum}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const verified = index.tcaSections.has(sectionNum);
    const snippet = verified
      ? (index.tcaSnippets.get(sectionNum) || extractCorpusSnippet(corpusText, sectionNum)).substring(0, 200)
      : '';

    citations.push({
      title: `T.C.A. § ${sectionNum}`,
      citation: `T.C.A. § ${sectionNum}`,
      type: "TCA",
      verified,
      snippet,
    });
  }

  // Extract and verify TRJPP rule citations
  const trjppRegex = new RegExp(TRJPP_PATTERN.source, TRJPP_PATTERN.flags);
  while ((match = trjppRegex.exec(responseText)) !== null) {
    const ruleNum = match[1];
    const key = `TRJPP-${ruleNum}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const verified = index.trjppRules.has(ruleNum);
    const snippet = verified
      ? (index.trjppSnippets.get(ruleNum) || extractCorpusSnippet(corpusText, `Rule ${ruleNum}`)).substring(0, 200)
      : '';

    citations.push({
      title: `TRJPP Rule ${ruleNum}`,
      citation: `TRJPP Rule ${ruleNum}`,
      type: "TRJPP",
      verified,
      snippet,
    });
  }

  // Extract and verify DCS policy citations
  const dcsRegex = new RegExp(DCS_PATTERN.source, DCS_PATTERN.flags);
  while ((match = dcsRegex.exec(responseText)) !== null) {
    const policyNum = match[1];
    const key = `DCS-${policyNum}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const verified = index.dcsPolicies.has(policyNum);
    const snippet = verified
      ? (index.dcsSnippets.get(policyNum) || extractCorpusSnippet(corpusText, `Policy ${policyNum}`)).substring(0, 200)
      : '';

    citations.push({
      title: `DCS Policy ${policyNum}`,
      citation: `DCS Policy ${policyNum}`,
      type: "DCS",
      verified,
      snippet,
    });
  }

  // Detect case law citations — these cannot be verified
  for (const pattern of CASE_LAW_PATTERNS) {
    const caseRegex = new RegExp(pattern.source, pattern.flags);
    while ((match = caseRegex.exec(responseText)) !== null) {
      const caseCite = match[0].trim();
      const key = `CASE-${caseCite}`;
      if (seen.has(key)) continue;
      seen.add(key);

      citations.push({
        title: caseCite,
        citation: caseCite,
        type: "CASELAW",
        verified: false,
        snippet: "Case citations cannot be verified by BenchBook. Confirm independently before relying on this reference.",
      });
    }
  }

  return citations;
}

/**
 * Extract a snippet from the corpus text around a search term.
 */
function extractCorpusSnippet(corpusText: string, searchTerm: string): string {
  const idx = corpusText.indexOf(searchTerm);
  if (idx !== -1) {
    const start = Math.max(0, idx);
    const end = Math.min(corpusText.length, idx + 200);
    return corpusText.slice(start, end).trim();
  }
  // Case-insensitive fallback
  const lowerIdx = corpusText.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (lowerIdx !== -1) {
    const start = Math.max(0, lowerIdx);
    const end = Math.min(corpusText.length, lowerIdx + 200);
    return corpusText.slice(start, end).trim();
  }
  return '';
}

/**
 * Confidence level for a response based on citation verification.
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Compute confidence score for a response based on its verified citations.
 *
 * HIGH:   All statute/rule citations verified, no unverifiable case law
 * MEDIUM: All statutes verified, but case law references present
 * LOW:    One or more statute/rule citations could not be verified
 */
export function computeConfidence(citations: VerifiedCitation[]): {
  level: ConfidenceLevel;
  reason: string;
} {
  if (citations.length === 0) {
    return { level: 'HIGH', reason: 'No citations to verify' };
  }

  const statuteCitations = citations.filter(c => c.type !== 'CASELAW');
  const caseLawCitations = citations.filter(c => c.type === 'CASELAW');
  const unverifiedStatutes = statuteCitations.filter(c => !c.verified);

  if (unverifiedStatutes.length > 0) {
    const unverifiedList = unverifiedStatutes.map(c => c.citation).join(', ');
    return {
      level: 'LOW',
      reason: `Unverified citations: ${unverifiedList}. These could not be found in the loaded legal corpus.`,
    };
  }

  if (caseLawCitations.length > 0) {
    return {
      level: 'MEDIUM',
      reason: 'All statute citations verified, but case law references cannot be verified by BenchBook. Confirm case citations independently.',
    };
  }

  return {
    level: 'HIGH',
    reason: 'All citations verified against the legal corpus.',
  };
}
