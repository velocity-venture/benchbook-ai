"use client";

import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Scale,
  FileText,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Clock,
  Filter,
} from "lucide-react";
import { tcaSections } from "@/lib/tca-data";

type SourceTab = "all" | "tca" | "trjpp" | "dcs";

interface SearchResult {
  id: string;
  title: string;
  citation: string;
  type: "TCA" | "TRJPP" | "DCS";
  snippet: string;
  bookmarked?: boolean;
}

export default function StatuteSearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SourceTab>("all");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [recentSearches] = useState(["detention hearing", "TPR grounds", "bond conditions"]);

  const tabs: { id: SourceTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "all", label: "All Sources", icon: Search, count: 124 },
    { id: "tca", label: "TCA", icon: BookOpen, count: 55 },
    { id: "trjpp", label: "TRJPP", icon: Scale, count: 44 },
    { id: "dcs", label: "DCS", icon: FileText, count: 25 },
  ];

  // Generate search results from real TCA data
  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    if (activeTab === "all" || activeTab === "tca") {
      tcaSections
        .filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        )
        .slice(0, 15)
        .forEach((s) => {
          matches.push({
            id: s.id,
            title: s.title,
            citation: `T.C.A. § ${s.id}`,
            type: "TCA",
            snippet: s.description || s.title,
          });
        });
    }

    // Add mock TRJPP results
    if ((activeTab === "all" || activeTab === "trjpp") && "rule".includes(q) || "juvenile".includes(q) || "hearing".includes(q)) {
      matches.push({
        id: "trjpp-5",
        title: "Detention Procedures",
        citation: "TRJPP Rule 5",
        type: "TRJPP",
        snippet: "Procedures for detention hearings and review of detention orders in juvenile court.",
      });
      matches.push({
        id: "trjpp-20",
        title: "Adjudicatory Hearings",
        citation: "TRJPP Rule 20",
        type: "TRJPP",
        snippet: "Requirements for conducting adjudicatory hearings, including evidentiary standards and procedural safeguards.",
      });
    }

    return matches.slice(0, 20);
  }, [query, activeTab]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const typeStyles = {
    TCA: { bg: "bg-blue-500/10", text: "text-blue-400" },
    TRJPP: { bg: "bg-orange-500/10", text: "text-orange-400" },
    DCS: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  };

  return (
    <div className="flex h-full">
      {/* Search panel */}
      <div className={`flex-1 ${selectedResult ? "hidden lg:block lg:max-w-lg lg:border-r lg:border-white/[0.06]" : ""}`}>
        <div className="p-6 border-b border-white/[0.06]">
          <h1 className="text-lg font-semibold text-white tracking-tight mb-4">
            Statute Search
          </h1>

          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search statutes, rules, or keywords..."
              className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/20 transition-colors"
              autoFocus
            />
          </div>

          {/* Source tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{ height: "calc(100vh - 220px)" }}>
          {/* Recent searches (when no query) */}
          {!query && (
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Recent Searches
              </p>
              <div className="space-y-1">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    {search}
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-6 mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3 h-3" />
                Bookmarked
              </p>
              {bookmarks.size === 0 ? (
                <p className="text-xs text-slate-600 px-3 py-2">No bookmarks yet</p>
              ) : (
                <p className="text-xs text-slate-500 px-3 py-2">{bookmarks.size} bookmarked</p>
              )}
            </div>
          )}

          {/* Results */}
          {query && (
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                {results.length} results
              </p>
              <div className="space-y-1">
                {results.map((result) => {
                  const style = typeStyles[result.type];
                  return (
                    <button
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedResult?.id === result.id
                          ? "bg-white/[0.06] border border-white/[0.1]"
                          : "hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${style.bg} ${style.text}`}>
                          {result.type}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{result.citation}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(result.id);
                          }}
                          className="ml-auto"
                        >
                          {bookmarks.has(result.id) ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5 text-slate-700 hover:text-slate-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{result.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{result.snippet}</p>
                    </button>
                  );
                })}
              </div>

              {results.length === 0 && query && (
                <div className="py-12 text-center">
                  <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedResult ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            <button
              onClick={() => setSelectedResult(null)}
              className="lg:hidden flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to results
            </button>

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${typeStyles[selectedResult.type].bg} ${typeStyles[selectedResult.type].text}`}>
                    {selectedResult.type}
                  </span>
                  <span className="text-sm text-slate-500 font-mono">{selectedResult.citation}</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{selectedResult.title}</h1>
              </div>
              <button
                onClick={() => toggleBookmark(selectedResult.id)}
                className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors shrink-0"
              >
                {bookmarks.has(selectedResult.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <Bookmark className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>

            {/* AI Summary */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Summary
              </h3>
              <p className="text-slate-300 leading-relaxed">{selectedResult.snippet}</p>
            </div>

            {/* Full text placeholder */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Full Text
              </h3>
              <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                <p>
                  The full statutory text for {selectedResult.citation} would be displayed here,
                  sourced from the embedded legal corpus. Cross-references to related statutes
                  are detected and linked automatically.
                </p>
                <p className="text-slate-600 italic">
                  [Full text rendering will be connected to the RAG pipeline]
                </p>
              </div>
            </div>

            {/* Cross-references */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" />
                Cross-References
              </h3>
              <div className="space-y-2">
                {["Related Section A", "Related Section B", "Related Section C"].map((ref, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/20 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-sm text-slate-300">{ref}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <Search className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Search for a statute to view details</p>
            <p className="text-slate-600 text-xs mt-1">Supports TCA sections, TRJPP rules, and DCS policies</p>
          </div>
        </div>
      )}
    </div>
  );
}
