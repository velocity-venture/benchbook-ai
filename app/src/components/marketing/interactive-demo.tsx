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
  "bond conditions": {
    title: "Bond Conditions in Juvenile Proceedings",
    type: "TCA",
    citation: "T.C.A. § 37-1-114(c)",
    summary:
      "A child taken into custody shall be released to the child's parent, guardian, or custodian upon the written promise to bring the child before the court when requested, unless detention or shelter care is warranted under T.C.A. § 37-1-114(c).",
    keyPoints: [
      "Release to parent/guardian is the default",
      "Written promise to appear is required",
      "Detention only when immediate welfare at risk",
      "Shelter care as an alternative to detention",
      "Must consider least restrictive alternative",
    ],
    relatedStatutes: [
      "T.C.A. § 37-1-114(a) — Taking into custody",
      "T.C.A. § 37-1-116 — Detention hearings",
      "TRJPP Rule 5 — Detention procedures",
    ],
  },
  "detention hearing": {
    title: "Detention Hearing Requirements",
    type: "TCA",
    citation: "T.C.A. § 37-1-117",
    summary:
      "A detention hearing must be held promptly, and no later than 72 hours (excluding weekends and holidays) after the child is placed in detention. The court must determine whether continued detention is necessary to protect the child or the community.",
    keyPoints: [
      "Must be held within 72 hours of placement",
      "Weekends and holidays excluded from calculation",
      "Probable cause finding required",
      "Right to counsel must be advised",
      "Written findings required for continued detention",
    ],
    relatedStatutes: [
      "T.C.A. § 37-1-114 — Taking into custody",
      "T.C.A. § 37-1-116 — Place of detention",
      "TRJPP Rule 5(b) — Detention hearing procedures",
    ],
  },
  "termination of parental rights": {
    title: "Grounds for Termination of Parental Rights",
    type: "TCA",
    citation: "T.C.A. § 36-1-113",
    summary:
      "Parental rights may be terminated upon a finding by clear and convincing evidence that grounds exist under T.C.A. § 36-1-113(g) and that termination is in the best interest of the child. The petition may be filed by any party with standing under the statute.",
    keyPoints: [
      "Clear and convincing evidence standard",
      "21 statutory grounds enumerated in § 36-1-113(g)",
      "Best interest analysis required (§ 36-1-113(i))",
      "Right to counsel at all stages",
      "Must consider statutory best interest factors",
    ],
    relatedStatutes: [
      "T.C.A. § 36-1-113(g) — Enumerated grounds",
      "T.C.A. § 36-1-113(i) — Best interest factors",
      "T.C.A. § 37-2-403 — DCS permanency plan",
    ],
  },
  "transfer to criminal court": {
    title: "Transfer to Criminal Court",
    type: "TCA",
    citation: "T.C.A. § 37-1-134",
    summary:
      "After a full investigation and hearing, the juvenile court may transfer a child aged 16 or older charged with a felony to criminal court if reasonable grounds exist to believe the child committed the offense and the interests of the community require transfer.",
    keyPoints: [
      "Child must be 16 or older",
      "Charged with a felony offense",
      "Full investigation and hearing required",
      "Kent factors must be considered",
      "Written findings of fact required",
    ],
    relatedStatutes: [
      "T.C.A. § 37-1-134(a)(1) — Transfer criteria",
      "T.C.A. § 37-1-134(b) — Mandatory transfer offenses",
      "TRJPP Rule 27 — Transfer proceedings",
    ],
  },
};

const suggestedQueries = [
  "bond conditions",
  "detention hearing",
  "termination of parental rights",
  "transfer to criminal court",
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
        setResult(matchKey ? mockResults[matchKey] : mockResults["bond conditions"]);
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
            Type a legal term or statute number. Watch as BenchBook.AI instantly
            generates a formatted bench card with cited sources.
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
                placeholder='Try "bond conditions" or "detention hearing"'
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
