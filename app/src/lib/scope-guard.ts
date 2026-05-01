export interface ScopeGuardResult {
  reason: string;
  matchedTerms: string[];
}

const EXCLUDED_TITLE_PATTERNS = [
  {
    term: "T.C.A. Title 39",
    pattern: /\b(?:title\s*)?39(?:-\d{1,3}-\d{1,4})?\b|t\.?c\.?a\.?\s*(?:§|section)?\s*39-/i,
  },
  {
    term: "T.C.A. Title 40",
    pattern: /\b(?:title\s*)?40(?:-\d{1,3}-\d{1,4})?\b|t\.?c\.?a\.?\s*(?:§|section)?\s*40-/i,
  },
  {
    term: "T.C.A. Title 55",
    pattern: /\b(?:title\s*)?55(?:-\d{1,3}-\d{1,4})?\b|t\.?c\.?a\.?\s*(?:§|section)?\s*55-/i,
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
