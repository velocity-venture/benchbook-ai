/**
 * Smart Query Router for BenchBook.AI
 *
 * Classifies query complexity to decide between Sonnet (complex)
 * and Haiku (simple) models. A judge cannot get a shallow answer
 * on sentencing, custody, or juvenile detention.
 */

/**
 * Classify query complexity for smart model routing.
 *
 * Complex legal queries ALWAYS route to Sonnet — a judge cannot get
 * a shallow answer on sentencing or juvenile detention.
 * Haiku handles only simple single-statute lookups and clarifications.
 */
export function classifyQueryComplexity(query: string): 'simple' | 'complex' {
  const queryLower = query.toLowerCase();

  // ALWAYS route to Sonnet — these are too important for the cheaper model
  const forceComplex = [
    // Multiple TCA references in one query
    (query.match(/\d+-\d+-\d+/g) || []).length > 1,
    // Sentencing, bond, probation
    /sentenc|bond\s+schedul|probation\s+condition|probation\s+violat|revocation/i.test(query),
    // Juvenile court (Title 37, TRJPP)
    /title\s+37|trjpp|juvenile\s+court|juvenile\s+detention/i.test(query),
    // DCS / dependency-neglect
    /\bdcs\b|department\s+of\s+children|dependency|neglect|child\s+abuse|removal/i.test(query),
    // Legal standards and complex analysis
    /probable\s+cause|due\s+process|preponderance|beyond\s+a\s+reasonable\s+doubt/i.test(query),
    /best\s+interest\s+of\s+the\s+child/i.test(query),
    // Custody and parenting
    /\bcustod[yial]|parenting\s+(?:time|plan)|residential\s+parent/i.test(query),
    // Bail (complements existing "bond schedul" match)
    /\bbail\b|bail\s+(?:hearing|revocation)/i.test(query),
    // Contempt proceedings
    /contempt(?:\s+of\s+court)?|willful\s+contempt|civil\s+contempt|criminal\s+contempt/i.test(query),
    // Mental health commitments (Title 33)
    /mental\s+health\s+commitment|judicial\s+commitment|title\s+33|involuntary\s+commitment/i.test(query),
    // Long queries — complex by nature
    query.length > 150,
    // Analysis/comparison requests
    /analyz|compar|evaluat|assess|what\s+factors?|how\s+should\s+i/i.test(query),
    /what\s+are\s+my\s+options|consider|weigh|balance/i.test(query),
    // Multiple questions
    (query.match(/\?/g) || []).length > 1,
    /multiple|several|various/i.test(query),
  ];

  if (forceComplex.some(Boolean)) {
    console.log(`[routing] Query -> Sonnet (complex indicators matched)`);
    return 'complex';
  }

  // Haiku only handles simple single-statute lookups and clarifications
  const isSimple =
    query.length < 100 &&
    (
      /what\s+is\s+the\s+statute/i.test(query) ||
      /define|definition/i.test(query) ||
      /deadline|time\s*limit|how\s+many\s+days/i.test(query) ||
      /clarif|explain\s+(?:that|your|the\s+previous)/i.test(query) ||
      (/t\.?c\.?a\.?\s*§?\s*\d+/.test(queryLower) && query.length < 80)
    );

  console.log(`[routing] Query -> ${isSimple ? 'Haiku' : 'Sonnet'} (length=${query.length})`);
  return isSimple ? 'simple' : 'complex';
}
