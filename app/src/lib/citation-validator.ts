/**
 * Citation Validation Engine for BenchBook.AI
 *
 * Builds an index of real legal citations from the loaded corpus,
 * then verifies citations in AI responses against that index.
 */

export interface CitationIndex {
  tcaSections: Set<string>;   // e.g. "37-1-114", "36-1-102"
  trjppRules: Set<string>;    // e.g. "101", "206"
  dcsPolicies: Set<string>;   // e.g. "14.12", "16.7"
}

export interface VerifiedCitation {
  title: string;
  citation: string;
  type: "TCA" | "DCS" | "TRJPP" | "LOCAL" | "CASELAW";
  verified: boolean;
  snippet: string;
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

  // Extract TCA section numbers from corpus text
  const tcaPattern = /(?:section|§)\s*(\d+-\d+-\d+)/gi;
  for (const text of [tcaText37, tcaText36]) {
    if (!text) continue;
    let match;
    while ((match = tcaPattern.exec(text)) !== null) {
      tcaSections.add(match[1]);
    }
  }

  // Extract TRJPP rule numbers
  if (trjppText) {
    const rulePattern = /RULE\s+(\d+)/gi;
    let match;
    while ((match = rulePattern.exec(trjppText)) !== null) {
      trjppRules.add(match[1]);
    }
  }

  // Extract DCS policy numbers from parsed PDF text and filenames
  if (dcsText) {
    // From content: "Policy 14.12" or "Chapter 14" style references
    const policyPattern = /(?:policy|chapter|chap)\s*(\d+(?:\.\d+)?)/gi;
    let match;
    while ((match = policyPattern.exec(dcsText)) !== null) {
      dcsPolicies.add(match[1]);
    }
    // From section headers embedded by our parser: "=== DCS Policy: chap14-14.12.pdf ==="
    const fileHeaderPattern = /DCS Policy: chap\d+-(\d+\.\d+)\.pdf/g;
    while ((match = fileHeaderPattern.exec(dcsText)) !== null) {
      dcsPolicies.add(match[1]);
    }
  }

  return { tcaSections, trjppRules, dcsPolicies };
}

/**
 * Extract citations from an AI response and verify each against the corpus index.
 * Returns verified citations with snippets from the actual corpus text.
 */
export function verifyCitations(
  responseText: string,
  index: CitationIndex,
  corpusText: string
): VerifiedCitation[] {
  const citations: VerifiedCitation[] = [];
  const seen = new Set<string>();

  // Extract and verify TCA citations
  const tcaMatches = responseText.match(/T\.C\.A\.?\s*§?\s*(\d+-\d+-\d+)/gi) || [];
  for (const match of tcaMatches) {
    const sectionNum = match.replace(/T\.C\.A\.?\s*§?\s*/i, '').trim();
    const key = `TCA-${sectionNum}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const verified = index.tcaSections.has(sectionNum);
    const snippet = verified ? extractCorpusSnippet(corpusText, sectionNum) : '';

    citations.push({
      title: `T.C.A. § ${sectionNum}`,
      citation: `T.C.A. § ${sectionNum}`,
      type: "TCA",
      verified,
      snippet,
    });
  }

  // Extract and verify TRJPP rule citations
  const trjppMatches = responseText.match(/(?:TRJPP\s+)?Rule\s+(\d+)/gi) || [];
  for (const match of trjppMatches) {
    const ruleNum = match.match(/(\d+)/)?.[1];
    if (!ruleNum) continue;
    const key = `TRJPP-${ruleNum}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const verified = index.trjppRules.has(ruleNum);
    const snippet = verified ? extractCorpusSnippet(corpusText, `Rule ${ruleNum}`) : '';

    citations.push({
      title: `TRJPP Rule ${ruleNum}`,
      citation: `TRJPP Rule ${ruleNum}`,
      type: "TRJPP",
      verified,
      snippet,
    });
  }

  // Extract and verify DCS policy citations
  const dcsMatches = responseText.match(/DCS\s+Policy\s+([0-9.]+)/gi) || [];
  for (const match of dcsMatches) {
    const policyNum = match.replace(/DCS\s+Policy\s+/i, '').trim();
    const key = `DCS-${policyNum}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const verified = index.dcsPolicies.has(policyNum);
    const snippet = verified ? extractCorpusSnippet(corpusText, `Policy ${policyNum}`) : '';

    citations.push({
      title: `DCS Policy ${policyNum}`,
      citation: `DCS Policy ${policyNum}`,
      type: "DCS",
      verified,
      snippet,
    });
  }

  return citations;
}

/**
 * Extract a snippet from the corpus text around a search term.
 */
function extractCorpusSnippet(corpusText: string, searchTerm: string): string {
  const idx = corpusText.indexOf(searchTerm);
  if (idx === -1) {
    // Try case-insensitive search
    const lowerIdx = corpusText.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (lowerIdx === -1) return '';
    const start = Math.max(0, lowerIdx);
    const end = Math.min(corpusText.length, lowerIdx + 200);
    return corpusText.slice(start, end).trim();
  }
  const start = Math.max(0, idx);
  const end = Math.min(corpusText.length, idx + 200);
  return corpusText.slice(start, end).trim();
}
