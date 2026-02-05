"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search as SearchIcon,
  FileText,
  MessageSquare,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SearchCategory = "all" | "cases" | "documents" | "tca" | "chat";

interface SearchResult {
  id: string;
  type: "case" | "document" | "tca" | "chat";
  title: string;
  subtitle: string;
  date?: string;
  snippet?: string;
}

// Mock search results
const mockResults: SearchResult[] = [
  {
    id: "1",
    type: "case",
    title: "2024-JV-0203",
    subtitle: "M.S. - Dependent/Neglect",
    date: "Jan 28, 2024",
    snippet: "Educational neglect petition filed by DCS...",
  },
  {
    id: "2",
    type: "tca",
    title: "T.C.A. § 37-1-114",
    subtitle: "Criteria for detention of child",
    snippet: "A child may be held in detention prior to adjudication...",
  },
  {
    id: "3",
    type: "document",
    title: "Detention Order - T.W.",
    subtitle: "Case 2024-JV-0211",
    date: "Feb 1, 2024",
    snippet: "ORDER OF DETENTION. The child T.W. shall be detained...",
  },
  {
    id: "4",
    type: "chat",
    title: "Grounds for detention",
    subtitle: "AI Research conversation",
    date: "Feb 1, 2024",
    snippet: "Under T.C.A. § 37-1-114(a), a child may be detained only if...",
  },
  {
    id: "5",
    type: "case",
    title: "2024-JV-0147",
    subtitle: "K.L. - Delinquent (Burglary)",
    date: "Dec 15, 2023",
    snippet: "Transfer hearing scheduled for criminal court evaluation...",
  },
];

const categoryConfig = {
  all: { label: "All", icon: SearchIcon, color: "text-white" },
  cases: { label: "Cases", icon: FileText, color: "text-blue-400" },
  documents: { label: "Documents", icon: FileText, color: "text-green-400" },
  tca: { label: "TN Code", icon: BookOpen, color: "text-purple-400" },
  chat: { label: "AI Chats", icon: MessageSquare, color: "text-amber-400" },
};

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  case: { icon: FileText, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  document: { icon: FileText, color: "text-green-400", bgColor: "bg-green-500/10" },
  tca: { icon: BookOpen, color: "text-purple-400", bgColor: "bg-purple-500/10" },
  chat: { icon: MessageSquare, color: "text-amber-400", bgColor: "bg-amber-500/10" },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    // Simulate search
    setTimeout(() => {
      const filtered = category === "all"
        ? mockResults
        : mockResults.filter((r) => r.type === category.slice(0, -1) || (category === "tca" && r.type === "tca"));
      setResults(filtered);
      setSearching(false);
    }, 500);
  };

  const recentSearches = [
    "detention review",
    "M.S. case",
    "transfer hearing",
    "37-1-114",
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-slate-400">Search across cases, documents, TN Code, and AI conversations</p>
      </div>

      {/* Search Box */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Search cases, documents, TN Code, conversations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {/* Category Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {(Object.keys(categoryConfig) as SearchCategory[]).map((cat) => {
              const config = categoryConfig[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    category === cat
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  <config.icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Recent Searches */}
          {!results && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResults(null);
                  setQuery("");
                }}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result) => {
              const config = typeConfig[result.type];
              return (
                <div
                  key={result.id}
                  className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgColor)}>
                    <config.icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn("text-xs", config.color)}>
                        {result.type.toUpperCase()}
                      </Badge>
                      {result.date && (
                        <span className="text-xs text-slate-500">{result.date}</span>
                      )}
                    </div>
                    <h3 className="font-medium text-white">{result.title}</h3>
                    <p className="text-sm text-slate-400">{result.subtitle}</p>
                    {result.snippet && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{result.snippet}</p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              );
            })}

            {results.length === 0 && (
              <div className="text-center py-8">
                <SearchIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No results found for "{query}"</p>
                <p className="text-sm text-slate-500 mt-1">Try different keywords or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Access when no results */}
      {!results && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Recent Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["2024-JV-0211 (T.W.)", "2024-JV-0203 (M.S.)", "2024-JV-0147 (K.L.)"].map((c) => (
                <Link
                  key={c}
                  href="/cases"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm text-slate-300">{c}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Recent Research
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Detention standards", "Transfer hearing requirements", "FERPA compliance"].map((r) => (
                <Link
                  key={r}
                  href="/chat"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm text-slate-300">{r}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
