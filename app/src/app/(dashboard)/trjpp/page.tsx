"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Scale,
} from "lucide-react";
import { trjppRules, searchTRJPP, type TRJPPRule } from "@/lib/trjpp-data";

const partGroups = [
  { partNum: 1, label: "Part 1 — General Provisions", color: "text-orange-400 border-orange-500" },
  { partNum: 2, label: "Part 2 — Delinquent and Unruly Children", color: "text-orange-400 border-orange-500" },
  { partNum: 3, label: "Part 3 — Dependent, Neglected, and Abused Children", color: "text-orange-400 border-orange-500" },
  { partNum: 4, label: "Part 4 — Foster Care Review Board", color: "text-orange-400 border-orange-500" },
];

export default function TRJPPPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [browsePart, setBrowsePart] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchTRJPP(searchQuery);
  }, [searchQuery]);

  const browseRules = useMemo(() => {
    if (browsePart === null) return [];
    return trjppRules.filter((r) => r.partNum === browsePart);
  }, [browsePart]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderRule = (rule: TRJPPRule) => {
    const isExpanded = expandedId === rule.id;
    return (
      <div
        key={rule.id}
        className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rule.id)}>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-orange-600">
                Rule {rule.id}
              </Badge>
              <span className="text-xs text-slate-500">{rule.part}</span>
            </div>
            <h3 className="font-medium text-white mt-2">{rule.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(`TRJPP Rule ${rule.id}`, rule.id)}
            >
              {copiedId === rule.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpandedId(isExpanded ? null : rule.id)}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{rule.summary}</p>
            <details className="group">
              <summary className="text-xs text-amber-400 cursor-pointer hover:text-amber-300 mb-2">
                Show full rule text
              </summary>
              <pre className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-sans mt-2 p-3 bg-slate-900 rounded-lg max-h-96 overflow-y-auto">
                {rule.text}
              </pre>
            </details>
            <div className="flex flex-wrap gap-1 mt-3">
              {rule.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const showingResults = results !== null;
  const showingBrowse = browsePart !== null && !showingResults;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">TRJPP Rules</h1>
          <p className="text-slate-400">
            {trjppRules.length} rules — Tennessee Rules of Juvenile Practice and Procedure
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Scale className="w-4 h-4" />
          Reference Only
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search by rule number (e.g., 307) or keywords..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setBrowsePart(null); }}
                className="pl-10 h-12 text-base"
              />
            </div>
            {searchQuery && (
              <Button variant="outline" size="lg" onClick={() => { setSearchQuery(""); setExpandedId(null); }}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-slate-500">Try:</span>
            {["adjudicatory", "detention", "disposition", "discovery", "permanency", "guardian ad litem", "service"].map((term) => (
              <button
                key={term}
                onClick={() => { setSearchQuery(term); setBrowsePart(null); }}
                className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {showingResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-400" />
              Search Results
            </CardTitle>
            <CardDescription>
              {results.length} rule{results.length !== 1 ? "s" : ""} found for &ldquo;{searchQuery}&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 && (
              <p className="text-slate-400 text-center py-4">
                No matching rules found. Try a different search term.
              </p>
            )}
            {results.map(renderRule)}
          </CardContent>
        </Card>
      )}

      {/* Browse by Part */}
      {showingBrowse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-orange-400" />
                {partGroups.find(g => g.partNum === browsePart)?.label}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setBrowsePart(null)}>
                Back
              </Button>
            </div>
            <CardDescription>{browseRules.length} rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {browseRules.map(renderRule)}
          </CardContent>
        </Card>
      )}

      {/* Default View */}
      {!showingResults && !showingBrowse && (
        <>
          {/* Browse by Part */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browse by Part</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {partGroups.map((group) => {
                  const count = trjppRules.filter(r => r.partNum === group.partNum).length;
                  return (
                    <button
                      key={group.partNum}
                      onClick={() => setBrowsePart(group.partNum)}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-orange-500/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{group.label}</p>
                        <p className="text-xs text-slate-500">{count} rules</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* All Rules */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">All Rules</h2>
            <div className="space-y-3">
              {trjppRules.map(renderRule)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
