export interface ScopeGuardResult {
  reason: string;
  matchedTerms: string[];
}

// A bare number ("40 days", "39 weeks") is not a statutory reference.
// Refuse only when the title number appears in statutory context: after
// the word "Title", as a full section number (39-13-101), or after a
// T.C.A. / Tenn. Code Ann. prefix.
const EXCLUDED_TITLE_PATTERNS = [
  {
    term: "T.C.A. Title 39",
    pattern: /\btitle\s*39\b|\b39-\d{1,3}-\d{1,4}\b|\b(?:t\.?c\.?a\.?|tenn\.?\s*code\s*ann\.?)\s*(?:§|section)?\s*39\b/i,
  },
  {
    term: "T.C.A. Title 40",
    pattern: /\btitle\s*40\b|\b40-\d{1,3}-\d{1,4}\b|\b(?:t\.?c\.?a\.?|tenn\.?\s*code\s*ann\.?)\s*(?:§|section)?\s*40\b/i,
  },
  {
    term: "T.C.A. Title 55",
    pattern: /\btitle\s*55\b|\b55-\d{1,3}-\d{1,4}\b|\b(?:t\.?c\.?a\.?|tenn\.?\s*code\s*ann\.?)\s*(?:§|section)?\s*55\b/i,
  },
];

const EXCLUDED_TOPIC_PATTERNS = [
  { term: "DUI or traffic offense", pattern: /\b(dui|driving under the influence|traffic offense|driv(?:e|ing) on (?:a )?revoked|motor vehicle)\b/i },
  { term: "adult criminal procedure", pattern: /\b(bond schedule|bail hearing|criminal sentencing|sentencing range|criminal procedure|probation revocation)\b/i },
  { term: "adult criminal offense", pattern: /\b(aggravated assault|theft offense|drug possession|criminal charge|class [abcde] felony|misdemeanor sentence)\b/i },
];

const JUVENILE_CONTEXT_PATTERN =
  /\b(juvenile|child|minor|delinquen|dependent|neglect|unruly|transfer|detention|custody|parent|guardian|dcs|foster|trjpp)\b/i;

export function detectOutOfScopeQuery(query: string): ScopeGuardResult | null {
  const matchedTerms: string[] = [];

  for (const item of EXCLUDED_TITLE_PATTERNS) {
    if (item.pattern.test(query)) {
      matchedTerms.push(item.term);
    }
  }

  for (const item of EXCLUDED_TOPIC_PATTERNS) {
    if (item.pattern.test(query) && !JUVENILE_CONTEXT_PATTERN.test(query)) {
      matchedTerms.push(item.term);
    }
  }

  if (matchedTerms.length === 0) {
    return null;
  }

  return {
    reason:
      "The question appears to ask for material outside the V1 BenchBook.AI legal corpus.",
    matchedTerms: [...new Set(matchedTerms)],
  };
}

export function buildScopeRefusal(result: ScopeGuardResult): string {
  const terms = result.matchedTerms.join(", ");

  return [
    "This is outside the V1 BenchBook.AI corpus.",
    "",
    `The question appears to involve ${terms}. V1 is limited to Tennessee Juvenile and Family Court research from T.C.A. Titles 36 and 37, TRJPP, selected DCS policies, and optional private local juvenile rules when a court provides them.`,
    "",
    "I cannot answer excluded Title 39, Title 40, Title 55, adult criminal, or traffic-law questions from the current closed corpus. Please verify those issues through an authorized source outside BenchBook.AI.",
  ].join("\n");
}
