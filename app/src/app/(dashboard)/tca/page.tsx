"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Copy,
  Check,
  BookOpen,
  Scale,
} from "lucide-react";
import { tcaSections, searchTCA, type TCASection } from "@/lib/tca-data";

// Key sections to feature on the landing view
const featuredIds = [
  "37-1-102", "37-1-114", "37-1-117", "37-1-128", "37-1-129",
  "37-1-134", "37-1-146", "36-1-113", "37-2-403", "37-1-116",
];

// Group sections by title for browsing
const titleGroups = [
  { titleNum: "37", label: "Title 37 — Juveniles", color: "text-blue-400 border-blue-500" },
  { titleNum: "36", label: "Title 36 — Domestic Relations", color: "text-purple-400 border-purple-500" },
  { titleNum: "Rules", label: "Rules of Juvenile Practice", color: "text-amber-400 border-amber-500" },
];

export default function TCAPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [browseTitle, setBrowseTitle] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchTCA(searchQuery);
  }, [searchQuery]);

  const featured = useMemo(
    () => tcaSections.filter((s) => featuredIds.includes(s.id)),
    []
  );

  const browseSections = useMemo(() => {
    if (!browseTitle) return [];
    return tcaSections.filter((s) => s.titleNum === browseTitle);
  }, [browseTitle]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSection = (section: TCASection) => {
    const isExpanded = expandedId === section.id;
    return (
      <div
        key={section.id}
        className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : section.id)}>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-600">
                {section.titleNum === "Rules" ? "" : "T.C.A. \u00a7 "}{section.id}
              </Badge>
              <span className="text-xs text-slate-500">{section.chapter}</span>
            </div>
            <h3 className="font-medium text-white mt-2">{section.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{section.description}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(
                section.titleNum === "Rules"
                  ? section.id
                  : `T.C.A. \u00a7 ${section.id}`,
                section.id
              )}
            >
              {copiedId === section.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpandedId(isExpanded ? null : section.id)}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-sm text-slate-300 leading-relaxed">{section.summary}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {section.tags.map((tag) => (
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
  const showingBrowse = browseTitle !== null && !showingResults;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tennessee Code Annotated</h1>
          <p className="text-slate-400">
            {tcaSections.length} sections covering juvenile court law, DCS, and related statutes
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
                placeholder="Search by section number (e.g., 37-1-114) or keywords..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setBrowseTitle(null); }}
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
            {["detention", "37-1-114", "transfer", "TPR", "disposition", "custody", "DCS", "appeal"].map((term) => (
              <button
                key={term}
                onClick={() => { setSearchQuery(term); setBrowseTitle(null); }}
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
              <Search className="w-5 h-5 text-amber-400" />
              Search Results
            </CardTitle>
            <CardDescription>
              {results.length} section{results.length !== 1 ? "s" : ""} found for &ldquo;{searchQuery}&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 && (
              <p className="text-slate-400 text-center py-4">
                No matching sections found. Try a different search term.
              </p>
            )}
            {results.map(renderSection)}
          </CardContent>
        </Card>
      )}

      {/* Browse by Title */}
      {showingBrowse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                {titleGroups.find(g => g.titleNum === browseTitle)?.label}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setBrowseTitle(null)}>
                Back
              </Button>
            </div>
            <CardDescription>{browseSections.length} sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {browseSections.map(renderSection)}
          </CardContent>
        </Card>
      )}

      {/* Default View — Featured + Browse + Resources */}
      {!showingResults && !showingBrowse && (
        <>
          {/* Featured Sections */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Key Sections</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {featured.map((section) => (
                <Card
                  key={section.id}
                  className="hover:border-amber-500/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-500">
                        {section.titleNum === "Rules" ? "" : "T.C.A. \u00a7 "}{section.id}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(`T.C.A. \u00a7 ${section.id}`, section.id);
                        }}
                      >
                        {copiedId === section.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <h3 className="font-medium text-white mb-1">{section.title}</h3>
                    <p className="text-sm text-slate-400">{section.description}</p>
                    {expandedId === section.id && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-sm text-slate-300 leading-relaxed">{section.summary}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {section.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={(e) => { e.stopPropagation(); setSearchQuery(tag); }}
                              className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Browse by Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browse by Title</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {titleGroups.map((group) => {
                  const count = tcaSections.filter(s => s.titleNum === group.titleNum).length;
                  return (
                    <button
                      key={group.titleNum}
                      onClick={() => setBrowseTitle(group.titleNum)}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{group.label}</p>
                        <p className="text-xs text-slate-500">{count} sections</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* External Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">External Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  {
                    name: "Lexis Tennessee Code",
                    url: "https://advance.lexis.com/",
                    description: "Official code with annotations",
                  },
                  {
                    name: "TN Courts Self-Help",
                    url: "https://www.tncourts.gov/",
                    description: "Court forms and procedures",
                  },
                  {
                    name: "DCS Policies",
                    url: "https://www.tn.gov/dcs/",
                    description: "Department of Children's Services",
                  },
                  {
                    name: "TRJPP Rules",
                    url: "https://www.tncourts.gov/rules",
                    description: "TN Rules of Juvenile Practice",
                  },
                ].map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{resource.name}</p>
                      <p className="text-xs text-slate-500">{resource.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
