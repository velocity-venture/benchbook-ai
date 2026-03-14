"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Star,
  ChevronRight,
  Sparkles,
  Printer,
  Download,
  Scale,
  FileText,
  Clock,
  Filter,
} from "lucide-react";

interface BenchCard {
  id: string;
  title: string;
  category: string;
  type: "TCA" | "TRJPP" | "DCS";
  description: string;
  citations: string[];
  lastAccessed?: string;
  pinned?: boolean;
}

const sampleCards: BenchCard[] = [
  {
    id: "1",
    title: "Detention Hearing Checklist",
    category: "Detention",
    type: "TCA",
    description: "Complete checklist for conducting a detention hearing under T.C.A. § 37-1-117, including required findings and timeframes.",
    citations: ["T.C.A. § 37-1-117", "T.C.A. § 37-1-114", "TRJPP Rule 5"],
    lastAccessed: "Today",
    pinned: true,
  },
  {
    id: "2",
    title: "Termination of Parental Rights — Grounds",
    category: "TPR",
    type: "TCA",
    description: "All 21 statutory grounds for termination under T.C.A. § 36-1-113(g) with best interest factors from § 36-1-113(i).",
    citations: ["T.C.A. § 36-1-113(g)", "T.C.A. § 36-1-113(i)"],
    lastAccessed: "Yesterday",
    pinned: true,
  },
  {
    id: "3",
    title: "Transfer to Criminal Court",
    category: "Transfer",
    type: "TCA",
    description: "Requirements and Kent factors for transferring a juvenile to criminal court under T.C.A. § 37-1-134.",
    citations: ["T.C.A. § 37-1-134", "TRJPP Rule 27"],
    lastAccessed: "3 days ago",
  },
  {
    id: "4",
    title: "DCS Investigation Timeline",
    category: "DCS",
    type: "DCS",
    description: "Required timelines and procedures for DCS investigations upon receipt of an abuse or neglect report.",
    citations: ["DCS Policy 14.1", "T.C.A. § 37-1-406"],
    lastAccessed: "Last week",
  },
  {
    id: "5",
    title: "Adjudicatory Hearing Procedures",
    category: "Adjudication",
    type: "TRJPP",
    description: "Procedural requirements for conducting adjudicatory hearings in juvenile court per TRJPP rules.",
    citations: ["TRJPP Rule 20", "T.C.A. § 37-1-129"],
  },
  {
    id: "6",
    title: "Dispositional Alternatives — Delinquency",
    category: "Disposition",
    type: "TCA",
    description: "Complete list of dispositional options available for adjudicated delinquent children.",
    citations: ["T.C.A. § 37-1-131", "T.C.A. § 37-1-132"],
  },
];

const typeStyles = {
  TCA: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  TRJPP: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  DCS: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export default function BenchCardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<BenchCard | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = sampleCards.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.citations.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || card.type === filterType;
    return matchesSearch && matchesType;
  });

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  return (
    <div className="flex h-full">
      {/* Card list */}
      <div className={`flex-1 ${selectedCard ? "hidden lg:block lg:max-w-md lg:border-r lg:border-white/[0.06]" : ""}`}>
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Bench Cards
            </h1>
            <button className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0e1a] rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Generate New
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bench cards..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/20 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            {["all", "TCA", "TRJPP", "DCS"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === type
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
          {pinned.length > 0 && (
            <div className="px-4 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Pinned
              </p>
              <div className="space-y-1">
                {pinned.map((card) => (
                  <CardListItem
                    key={card.id}
                    card={card}
                    selected={selectedCard?.id === card.id}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="px-4 pt-4 pb-4">
            {pinned.length > 0 && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                All Cards
              </p>
            )}
            <div className="space-y-1">
              {unpinned.map((card) => (
                <CardListItem
                  key={card.id}
                  card={card}
                  selected={selectedCard?.id === card.id}
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center">
              <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No bench cards match your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Card detail */}
      {selectedCard ? (
        <div className="flex-1 overflow-y-auto">
          <CardDetail card={selectedCard} onBack={() => setSelectedCard(null)} />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Select a bench card to view details</p>
            <p className="text-slate-600 text-xs mt-1">Or generate a new one with AI</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CardListItem({
  card,
  selected,
  onClick,
}: {
  card: BenchCard;
  selected: boolean;
  onClick: () => void;
}) {
  const style = typeStyles[card.type];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        selected
          ? "bg-white/[0.06] border border-white/[0.1]"
          : "hover:bg-white/[0.03] border border-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${style.bg} ${style.text}`}>
              {card.type}
            </span>
            {card.pinned && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
          </div>
          <p className="text-sm font-medium text-slate-200 truncate">{card.title}</p>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{card.description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-700 mt-1 shrink-0" />
      </div>
      {card.lastAccessed && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
          <Clock className="w-2.5 h-2.5" />
          {card.lastAccessed}
        </div>
      )}
    </button>
  );
}

function CardDetail({ card, onBack }: { card: BenchCard; onBack: () => void }) {
  const style = typeStyles[card.type];

  // Mock key points based on card
  const keyPoints = [
    "Review all applicable statutory requirements before proceeding",
    "Ensure proper notice has been provided to all parties",
    "Document findings of fact in the court record",
    "Consider least restrictive alternatives where applicable",
    "Verify compliance with constitutional due process requirements",
  ];

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Back button (mobile) */}
      <button
        onClick={onBack}
        className="lg:hidden flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to cards
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${style.bg} ${style.text} ${style.border} border`}>
              {card.type}
            </span>
            <span className="text-sm text-slate-500">{card.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{card.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors" title="Pin">
            <Star className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors" title="Print">
            <Printer className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors" title="Export PDF">
            <Download className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          AI Summary
        </h3>
        <p className="text-slate-300 leading-relaxed">{card.description}</p>
      </div>

      {/* Key Points */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Key Points
        </h3>
        <ul className="space-y-2.5">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Citations */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Scale className="w-3.5 h-3.5" />
          Citations
        </h3>
        <div className="space-y-2">
          {card.citations.map((citation, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/20 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-sm text-slate-300 font-mono">{citation}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700 ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Personal Notes */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Personal Notes
        </h3>
        <textarea
          placeholder="Add your notes for this bench card..."
          className="w-full h-24 bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none resize-none"
        />
      </div>
    </div>
  );
}
