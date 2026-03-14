"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  BookOpen,
  FileUp,
  StickyNote,
  Settings,
  ArrowRight,
  FileText,
  Scale,
  Plus,
  Clock,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  action: () => void;
  category: "navigation" | "action" | "recent";
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      onClose();
    },
    [router, onClose]
  );

  const allCommands: CommandItem[] = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Go to Dashboard",
      category: "navigation",
      action: () => navigate("/dashboard"),
    },
    {
      id: "bench-cards",
      icon: BookOpen,
      label: "Browse Bench Cards",
      description: "Search and browse formatted bench cards",
      category: "navigation",
      action: () => navigate("/bench-cards"),
    },
    {
      id: "statutes",
      icon: Search,
      label: "Search Statutes",
      description: "Search Tennessee Code Annotated",
      category: "navigation",
      action: () => navigate("/statutes"),
    },
    {
      id: "documents",
      icon: FileUp,
      label: "Document Analyzer",
      description: "Upload and analyze court documents",
      category: "navigation",
      action: () => navigate("/documents"),
    },
    {
      id: "notes",
      icon: StickyNote,
      label: "Case Notes",
      description: "AI research sessions",
      category: "navigation",
      action: () => navigate("/chat"),
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      category: "navigation",
      action: () => navigate("/settings"),
    },
    {
      id: "new-card",
      icon: Plus,
      label: "New Bench Card",
      description: "Create a new bench card from a query",
      category: "action",
      action: () => navigate("/bench-cards?new=true"),
    },
    {
      id: "new-research",
      icon: Plus,
      label: "New Research Session",
      description: "Start a new AI research conversation",
      category: "action",
      action: () => navigate("/chat?new=true"),
    },
    {
      id: "search-tca",
      icon: Scale,
      label: "Search TCA",
      description: "Search Tennessee Code Annotated sections",
      category: "action",
      action: () => navigate("/statutes?focus=tca"),
    },
    {
      id: "search-trjpp",
      icon: FileText,
      label: "Search TRJPP",
      description: "Tennessee Rules of Juvenile Practice and Procedure",
      category: "action",
      action: () => navigate("/statutes?focus=trjpp"),
    },
  ];

  const filtered = query
    ? allCommands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const categories = {
    recent: { label: "Recent", icon: Clock },
    navigation: { label: "Navigation", icon: ArrowRight },
    action: { label: "Actions", icon: Plus },
  };

  const groupedCommands = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  let globalIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="w-full py-4 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                />
                <kbd className="px-1.5 py-0.5 text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded font-mono shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No results found
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category}>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        {categories[category as keyof typeof categories]?.label || category}
                      </p>
                      {commands.map((cmd) => {
                        const idx = globalIndex++;
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              selectedIndex === idx
                                ? "bg-white/[0.06] text-white"
                                : "text-slate-400 hover:bg-white/[0.04]"
                            }`}
                          >
                            <cmd.icon className={`w-4 h-4 shrink-0 ${selectedIndex === idx ? "text-amber-400" : ""}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{cmd.label}</p>
                              {cmd.description && (
                                <p className="text-xs text-slate-600 truncate">{cmd.description}</p>
                              )}
                            </div>
                            {selectedIndex === idx && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-slate-600">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
