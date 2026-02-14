"use client";

import React, { useState, useEffect } from "react";
import { Clock, Search, BookOpen, TrendingUp, RefreshCw } from "lucide-react";

interface TopQuery {
  query: string;
  count: number;
  last_used: string;
}

interface FrequentCitation {
  document_type: string;
  document_id: string;
  title: string;
  view_count: number;
  last_viewed: string;
}

interface ResearchPatterns {
  topQueries: TopQuery[];
  frequentCitations: FrequentCitation[];
  lastUpdated: string | null;
}

const ResearchPatterns: React.FC = () => {
  const [patterns, setPatterns] = useState<ResearchPatterns>({
    topQueries: [],
    frequentCitations: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchPatterns = async () => {
    try {
      const response = await fetch("/api/research-patterns");
      if (response.ok) {
        const data = await response.json();
        setPatterns(data);
      } else {
        console.error("Failed to fetch research patterns");
      }
    } catch (error) {
      console.error("Error fetching research patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePatterns = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/research-patterns", {
        method: "POST",
      });
      if (response.ok) {
        // Fetch updated patterns
        await fetchPatterns();
      } else {
        console.error("Failed to update research patterns");
      }
    } catch (error) {
      console.error("Error updating research patterns:", error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "TCA":
        return "text-blue-400 bg-blue-500/10";
      case "TRJPP":
        return "text-orange-400 bg-orange-500/10";
      case "DCS":
        return "text-green-400 bg-green-500/10";
      case "LOCAL":
        return "text-purple-400 bg-purple-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Research Patterns</h2>
          {patterns.lastUpdated && (
            <p className="text-sm text-slate-400 mt-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Last updated {formatDate(patterns.lastUpdated)}
            </p>
          )}
        </div>
        <button
          onClick={updatePatterns}
          disabled={updating}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
          {updating ? "Updating..." : "Refresh"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Most Searched Questions</h3>
          </div>
          {patterns.topQueries.length > 0 ? (
            <div className="space-y-3">
              {patterns.topQueries.slice(0, 8).map((query, index) => (
                <div
                  key={index}
                  className="group p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  onClick={() => {
                    // Navigate to chat with this query pre-filled
                    window.location.href = `/dashboard/chat?q=${encodeURIComponent(query.query)}`;
                  }}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-300 flex-1 group-hover:text-white transition">
                      {query.query}
                    </p>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                        {query.count}×
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Last used {formatDate(query.last_used)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">
              Start researching to see your most common questions here.
            </p>
          )}
        </div>

        {/* Frequent Citations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Most Accessed Legal Sources</h3>
          </div>
          {patterns.frequentCitations.length > 0 ? (
            <div className="space-y-3">
              {patterns.frequentCitations.slice(0, 10).map((citation, index) => (
                <div
                  key={index}
                  className="group p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  onClick={() => {
                    // Navigate to the appropriate document viewer
                    const docType = citation.document_type.toLowerCase();
                    window.location.href = `/dashboard/${docType}?section=${citation.document_id}`;
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${getDocumentTypeColor(
                            citation.document_type
                          )}`}
                        >
                          {citation.document_type}
                        </span>
                        <span className="text-xs text-slate-500">{citation.document_id}</span>
                      </div>
                      <p className="text-sm text-slate-300 group-hover:text-white transition">
                        {citation.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <TrendingUp className="w-3 h-3 text-slate-500" />
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        {citation.view_count}×
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Last viewed {formatDate(citation.last_viewed)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">
              Browse legal documents to see your most accessed sources here.
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-3 h-3 text-slate-950" />
          </div>
          <div>
            <p className="text-amber-400 font-medium text-sm">Personal Research Intelligence</p>
            <p className="text-amber-400/80 text-sm mt-1">
              The more you use BenchBook AI, the better it gets at suggesting relevant legal
              sources based on your research patterns. Click any item above to quickly access
              your frequently used resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPatterns;