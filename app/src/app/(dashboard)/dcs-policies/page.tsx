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
  FileText,
} from "lucide-react";
import { dcsPolicies, searchDCS, type DCSPolicy } from "@/lib/dcs-data";

const chapterGroups = [
  { chapterNum: "9", label: "Chapter 9 — Confidentiality", color: "text-green-400 border-green-500" },
  { chapterNum: "14", label: "Chapter 14 — Child Protective Services", color: "text-green-400 border-green-500" },
  { chapterNum: "16", label: "Chapter 16 — Foster Care", color: "text-green-400 border-green-500" },
];

export default function DCSPoliciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [browseChapter, setBrowseChapter] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchDCS(searchQuery);
  }, [searchQuery]);

  const browsePolicies = useMemo(() => {
    if (!browseChapter) return [];
    return dcsPolicies.filter((p) => p.chapterNum === browseChapter);
  }, [browseChapter]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderPolicy = (policy: DCSPolicy) => {
    const isExpanded = expandedId === policy.id;
    return (
      <div
        key={policy.id}
        className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : policy.id)}>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-green-600">
                DCS {policy.id}
              </Badge>
              <span className="text-xs text-slate-500">{policy.chapter}</span>
            </div>
            <h3 className="font-medium text-white mt-2">{policy.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{policy.description}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(`DCS Policy ${policy.id}`, policy.id)}
            >
              {copiedId === policy.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpandedId(isExpanded ? null : policy.id)}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-sm text-slate-300 leading-relaxed">{policy.summary}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {policy.tags.map((tag) => (
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
  const showingBrowse = browseChapter !== null && !showingResults;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">DCS Policies</h1>
          <p className="text-slate-400">
            {dcsPolicies.length} policies covering confidentiality, child protective services, and foster care
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText className="w-4 h-4" />
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
                placeholder="Search by policy number (e.g., 14.1) or keywords..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setBrowseChapter(null); }}
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
            {["hotline", "screening", "investigation", "foster", "drug-exposed", "MEPA", "SIU", "resource linkage"].map((term) => (
              <button
                key={term}
                onClick={() => { setSearchQuery(term); setBrowseChapter(null); }}
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
              <Search className="w-5 h-5 text-green-400" />
              Search Results
            </CardTitle>
            <CardDescription>
              {results.length} polic{results.length !== 1 ? "ies" : "y"} found for &ldquo;{searchQuery}&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 && (
              <p className="text-slate-400 text-center py-4">
                No matching policies found. Try a different search term.
              </p>
            )}
            {results.map(renderPolicy)}
          </CardContent>
        </Card>
      )}

      {/* Browse by Chapter */}
      {showingBrowse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                {chapterGroups.find(g => g.chapterNum === browseChapter)?.label}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setBrowseChapter(null)}>
                Back
              </Button>
            </div>
            <CardDescription>{browsePolicies.length} policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {browsePolicies.map(renderPolicy)}
          </CardContent>
        </Card>
      )}

      {/* Default View */}
      {!showingResults && !showingBrowse && (
        <>
          {/* Browse by Chapter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browse by Chapter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {chapterGroups.map((group) => {
                  const count = dcsPolicies.filter(p => p.chapterNum === group.chapterNum).length;
                  return (
                    <button
                      key={group.chapterNum}
                      onClick={() => setBrowseChapter(group.chapterNum)}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-green-500/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{group.label}</p>
                        <p className="text-xs text-slate-500">{count} policies</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* All Policies */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">All Policies</h2>
            <div className="space-y-3">
              {dcsPolicies.map(renderPolicy)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
