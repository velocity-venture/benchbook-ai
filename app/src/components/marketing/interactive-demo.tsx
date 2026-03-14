"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Scale, FileText, Sparkles, ArrowRight } from "lucide-react";

interface BenchCardResult {
  title: string;
  type: "TCA" | "TRJPP" | "DCS";
  citation: string;
  summary: string;
  keyPoints: string[];
  relatedStatutes: string[];
}

const mockResults: Record<string, BenchCardResult> = {
  "reasonable efforts": {
    title: "Reasonable Efforts Requirement",
    type: "TCA",
    citation: "T.C.A. § 37-1-166",
    summary:
      "The court shall determine whether reasonable efforts have been made by DCS to prevent removal, reunify the family, or finalize a permanency plan. DCS bears the burden of demonstrating reasonable efforts at each stage of the proceeding.",
    keyPoints: [
      "Required finding at every hearing where custody is at issue",
      "DCS must document specific services offered or provided",
      "Court may find NO reasonable efforts — triggers corrective action",
      "Federal funding (Title IV-E) contingent on reasonable efforts finding",
      "Failure to make reasonable efforts may delay or prevent TPR",
    ],
    relatedStatutes: [
      "T.C.A. § 37-1-166(a) — Reasonable efforts defined",
      "T.C.A. § 37-2-403 — Permanency plan requirements",
      "DCS Policy 16.32 — Foster Care Review and Progress Reports",
    ],
  },
  "permanency plan timeline": {
    title: "Permanency Plan Filing & Review Timeline",
    type: "TCA",
    citation: "T.C.A. § 37-2-409",
    summary:
      "DCS must file the initial permanency plan within 30 days of custody. The court must conduct a permanency hearing no later than 12 months from the date the child enters foster care, and every 12 months thereafter. DCS must lodge the plan with the Clerk at least 10 days before ratification.",
    keyPoints: [
      "Initial plan due within 30 days of DCS custody",
      "First permanency hearing within 12 months of entry into care",
      "Subsequent reviews every 12 months minimum",
      "Plan must be filed 10 days before ratification hearing (Local Rule 4.13)",
      "ASFA 15-of-22 month rule for filing TPR petition",
    ],
    relatedStatutes: [
      "T.C.A. § 37-2-403 — Permanency plan content requirements",
      "DCS Policy 16.6 — Permanency Planning",
      "Local Rule 4.13 — Permanency Plan filing deadline",
    ],
  },
  "dcs court preparation": {
    title: "DCS Court Preparation & Attendance",
    type: "DCS",
    citation: "DCS Policy 16.32 / Court Attendance Protocol",
    summary:
      "DCS case managers must attend all court hearings with current progress reports, updated permanency plans, and documentation of services provided. Reports must be filed in advance, not on the day of the hearing.",
    keyPoints: [
      "Progress reports must be filed BEFORE the hearing",
      "Case manager must be present and prepared to testify",
      "Documentation of all services offered and provided",
      "Failure to appear prepared wastes court resources",
      "Non-compliance may result in show cause proceedings",
    ],
    relatedStatutes: [
      "DCS Court Preparation Protocol (Feb. 2022)",
      "T.C.A. § 37-1-159 — Court-ordered assessments",
      "Local Rule 2.05 — Court begins at 9:00 AM",
    ],
  },
  "casa notice requirements": {
    title: "CASA/GAL Notice & Participation Requirements",
    type: "TRJPP",
    citation: "Local Rule 4.16 / TRJPP Rule 2.09",
    summary:
      "CASA and Guardian ad Litem are deemed parties for notice purposes and must be notified of all hearings, staffings, CFTMs, and family meetings. DCS must include CASA on all scheduling communications and respond within 24-48 hours.",
    keyPoints: [
      "CASA/GAL deemed a party — entitled to full notice",
      "Must be notified of all CFTMs and family meetings",
      "Certificate of Service required for all filings",
      "24-48 hour response window to CASA communications",
      "Failure to notify may result in sanctions under Local Rule 4.16",
    ],
    relatedStatutes: [
      "TRJPP Rule 2.09 — Service and notice requirements",
      "Local Rule 4.16 — CASA notification mandate",
      "T.C.A. § 37-1-149 — CASA appointment authority",
    ],
  },
};

const suggestedQueries = [
  "reasonable efforts",
  "permanency plan timeline",
  "DCS court preparation",
  "CASA notice requirements",
];

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  TCA: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  TRJPP: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  DCS: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export function InteractiveDemo() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<BenchCardResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery || query).toLowerCase().trim();
      if (!q) return;

      setIsSearching(true);
      setResult(null);

      // Find best match
      const matchKey = Object.keys(mockResults).find(
        (key) => q.includes(key) || key.includes(q)
      );

      setTimeout(() => {
        setResult(matchKey ? mockResults[matchKey] : mockResults["reasonable efforts"]);
        setIsSearching(false);
      }, 800);
    },
    [query]
  );

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <section id="demo" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1220] via-[#0a0f1f] to-[#0d1220]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.04),transparent_70%)]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Try It Now
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            See It In Action
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            DCS says they made reasonable efforts. You need the exact statute
            and policy number — right now, on the bench. Type a query below.
          </p>
        </motion.div>

        {/* Search box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#111827] border border-white/10 rounded-xl overflow-hidden group-focus-within:border-amber-500/30 transition-colors">
              <Search className="w-5 h-5 text-slate-500 ml-5 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder='Try "reasonable efforts" or "permanency plan timeline"'
                className="w-full px-4 py-5 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
              />
              <button
                onClick={() => handleSearch()}
                className="px-6 py-3 mr-2 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0e1a] rounded-lg font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shrink-0 flex items-center gap-2"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {suggestedQueries.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestion(suggestion)}
              className="px-4 py-2 text-sm text-slate-400 border border-white/10 rounded-lg hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5 transition-all duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isSearching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-400 text-sm">
                    Searching Tennessee legal corpus...
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                  <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
                </div>
              </div>
            </motion.div>
          )}

          {result && !isSearching && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                {/* Card header */}
                <div className="px-8 py-6 border-b border-white/5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md ${typeColors[result.type].bg} ${typeColors[result.type].text} ${typeColors[result.type].border} border`}
                      >
                        {result.type}
                      </span>
                      <span className="text-sm text-slate-500 font-mono">
                        {result.citation}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{result.title}</h3>
                  </div>
                  <BookOpen className="w-5 h-5 text-slate-500 shrink-0 mt-1" />
                </div>

                {/* Summary */}
                <div className="px-8 py-6 border-b border-white/5">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    AI Summary
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Key points */}
                <div className="px-8 py-6 border-b border-white/5">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Related statutes */}
                <div className="px-8 py-6">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5" />
                    Related Authorities
                  </h4>
                  <div className="space-y-2">
                    {result.relatedStatutes.map((statute, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + 0.1 * i }}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        {statute}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
