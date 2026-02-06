"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search as SearchIcon,
  FileText,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { caseTypeDisplay } from "@/lib/db";
import { searchTCA } from "@/lib/tca-data";

type SearchCategory = "all" | "cases" | "documents" | "tca";

interface SearchResult {
  id: string;
  type: "case" | "document" | "tca";
  title: string;
  subtitle: string;
  date?: string;
  snippet?: string;
  href: string;
}

const categoryConfig = {
  all: { label: "All", icon: SearchIcon, color: "text-white" },
  cases: { label: "Cases", icon: FileText, color: "text-blue-400" },
  documents: { label: "Documents", icon: FileText, color: "text-green-400" },
  tca: { label: "TN Code", icon: BookOpen, color: "text-purple-400" },
};

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  case: { icon: FileText, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  document: { icon: FileText, color: "text-green-400", bgColor: "bg-green-500/10" },
  tca: { icon: BookOpen, color: "text-purple-400", bgColor: "bg-purple-500/10" },
};

// TCA search now uses shared data from lib/tca-data.ts

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    const allResults: SearchResult[] = [];
    const q = query.trim().toLowerCase();

    const supabase = createClient();

    // Search cases
    if (category === "all" || category === "cases") {
      const { data: cases } = await supabase
        .from("cases")
        .select("id, case_number, child_initials, child_age, case_type, status, allegation, attorney, filed_date")
        .or(`case_number.ilike.%${q}%,child_initials.ilike.%${q}%,allegation.ilike.%${q}%,attorney.ilike.%${q}%`)
        .limit(10);

      if (cases) {
        allResults.push(
          ...cases.map((c) => ({
            id: c.id,
            type: "case" as const,
            title: c.case_number,
            subtitle: `${c.child_initials}${c.child_age ? `, Age ${c.child_age}` : ""} — ${caseTypeDisplay[c.case_type] || c.case_type}`,
            date: c.filed_date
              ? new Date(c.filed_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : undefined,
            snippet: c.allegation || undefined,
            href: `/cases/${c.id}`,
          }))
        );
      }
    }

    // Search documents
    if (category === "all" || category === "documents") {
      const { data: docs } = await supabase
        .from("documents")
        .select("id, name, status, created_at")
        .ilike("name", `%${q}%`)
        .limit(10);

      if (docs) {
        allResults.push(
          ...docs.map((d) => ({
            id: d.id,
            type: "document" as const,
            title: d.name,
            subtitle: d.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            href: `/documents/${d.id}`,
          }))
        );
      }
    }

    // Search TCA (shared dataset from lib/tca-data.ts)
    if (category === "all" || category === "tca") {
      const tcaMatches = searchTCA(q).slice(0, 10);
      allResults.push(
        ...tcaMatches.map((s) => ({
          id: s.id,
          type: "tca" as const,
          title: `${s.titleNum === "Rules" ? "" : "T.C.A. \u00a7 "}${s.id}`,
          subtitle: s.title,
          snippet: s.description,
          href: "/tca",
        }))
      );
    }

    setResults(allResults);
    setSearching(false);
  };

  const recentSearches = [
    "detention review",
    "dependent neglect",
    "transfer hearing",
    "37-1-114",
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-slate-400">Search across cases, documents, and TN Code</p>
      </div>

      {/* Search Box */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Search cases, documents, TN Code..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" disabled={searching}>
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Search"
                )}
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
                  {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
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
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors"
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
                  <ArrowRight className="w-4 h-4 text-slate-500 mt-3" />
                </Link>
              );
            })}

            {results.length === 0 && (
              <div className="text-center py-8">
                <SearchIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No results found for &ldquo;{query}&rdquo;</p>
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
                Browse Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/cases"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span className="text-sm text-slate-300">View all cases</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Browse TN Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/tca"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span className="text-sm text-slate-300">Browse Tennessee Code Annotated</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
