"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Star,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Common TCA sections for juvenile court
const commonSections = [
  {
    id: "37-1-101",
    title: "Definitions",
    chapter: "Chapter 1 - Juvenile Courts and Proceedings",
    description: "Key definitions for juvenile court proceedings",
    citations: 156,
  },
  {
    id: "37-1-114",
    title: "Detention",
    chapter: "Chapter 1 - Juvenile Courts and Proceedings",
    description: "Grounds and procedures for juvenile detention",
    citations: 89,
  },
  {
    id: "37-1-117",
    title: "Conduct of Hearings",
    chapter: "Chapter 1 - Juvenile Courts and Proceedings",
    description: "Rules for conducting juvenile hearings",
    citations: 67,
  },
  {
    id: "37-1-129",
    title: "Dispositions",
    chapter: "Chapter 1 - Juvenile Courts and Proceedings",
    description: "Available dispositional alternatives",
    citations: 102,
  },
  {
    id: "37-1-134",
    title: "Transfer to Criminal Court",
    chapter: "Chapter 1 - Juvenile Courts and Proceedings",
    description: "Procedures for transferring juveniles to criminal court",
    citations: 45,
  },
  {
    id: "37-1-146",
    title: "Sealing Records",
    chapter: "Chapter 1 - Juvenile Courts and Proceedings",
    description: "Expungement and sealing of juvenile records",
    citations: 34,
  },
  {
    id: "36-1-113",
    title: "Termination of Parental Rights",
    chapter: "Chapter 1 - Adoption",
    description: "Grounds for termination of parental rights",
    citations: 78,
  },
  {
    id: "37-2-403",
    title: "Child Abuse Reporting",
    chapter: "Chapter 2 - Department of Children's Services",
    description: "Mandatory reporting requirements",
    citations: 52,
  },
];

// Mock search results
const mockSearchResults = [
  {
    id: "37-1-114",
    title: "Criteria for detention of child",
    text: `(a) A child may be held in detention prior to adjudication or disposition only if:
(1) The child is alleged to have committed an offense which if committed by an adult would be a felony...
(2) The child is already detained or on conditional release...
(3) The child is a fugitive from another jurisdiction...`,
    relevance: 98,
  },
  {
    id: "37-1-114a",
    title: "Detention hearing requirements",
    text: `(b) A detention hearing shall be held within forty-eight (48) hours, exclusive of nonjudicial days...`,
    relevance: 92,
  },
];

export default function TCAPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof mockSearchResults | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    // Simulate search
    setTimeout(() => {
      setResults(mockSearchResults);
      setSearching(false);
    }, 1000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Tennessee Code Annotated</h1>
        <p className="text-slate-400">Search and browse TN law relevant to juvenile court</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Search by section number (e.g., 37-1-114) or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-slate-500">Try:</span>
            {["detention", "37-1-114", "transfer hearing", "termination"].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              Search Results
            </CardTitle>
            <CardDescription>{results.length} sections found for "{searchQuery}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-800"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">T.C.A. § {result.id}</Badge>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500">
                        {result.relevance}% match
                      </Badge>
                    </div>
                    <h3 className="font-medium text-white mt-2">{result.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(`T.C.A. § ${result.id}`, result.id)}
                    >
                      {copiedId === result.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-400 whitespace-pre-wrap font-mono bg-slate-900 p-3 rounded-lg">
                  {result.text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Common Sections */}
      {!results && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Frequently Referenced Sections</h2>
            <Button variant="ghost" size="sm" className="text-slate-400">
              View All Title 37
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {commonSections.map((section) => (
              <Card
                key={section.id}
                className="hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-500">
                      T.C.A. § {section.id}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {section.citations} citations
                    </div>
                  </div>
                  <h3 className="font-medium text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">{section.description}</p>
                  <p className="text-xs text-slate-500">{section.chapter}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  { title: "Title 36 - Domestic Relations", sections: "Adoption, Custody, Support" },
                  { title: "Title 37 - Juveniles", sections: "Courts, DCS, Delinquency" },
                  { title: "Title 39 - Criminal Offenses", sections: "Offenses, Penalties" },
                ].map((title, i) => (
                  <button
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{title.title}</p>
                      <p className="text-xs text-slate-500">{title.sections}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
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
