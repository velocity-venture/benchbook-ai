"use client";

import { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Scale,
  FileText,
  MessageSquare,
  Clock,
  Loader2,
  ArrowRight,
  Star,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RecentSession {
  id: string;
  title: string;
  updatedAt: string;
}

interface QuickStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("Judge");
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const name =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0];
        if (name) setUserName(name);

        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("id, title, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (sessions) {
          setRecentSessions(
            sessions.map((s: { id: string; title: string; updated_at: string }) => ({
              id: s.id,
              title: s.title || "Untitled Research",
              updatedAt: formatRelativeDate(s.updated_at),
            }))
          );
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/statutes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats: QuickStat[] = [
    { label: "Research Sessions", value: String(recentSessions.length), icon: MessageSquare, color: "text-amber-400" },
    { label: "TCA Sections", value: "55", icon: BookOpen, color: "text-blue-400" },
    { label: "TRJPP Rules", value: "44", icon: Scale, color: "text-orange-400" },
    { label: "DCS Policies", value: "25", icon: FileText, color: "text-emerald-400" },
  ];

  const quickActions = [
    { label: "New Research", href: "/chat?new=true", icon: MessageSquare, description: "Start an AI research session" },
    { label: "Search Statutes", href: "/statutes", icon: Search, description: "Search TCA, TRJPP, DCS" },
    { label: "Bench Cards", href: "/bench-cards", icon: BookOpen, description: "Browse bench card library" },
    { label: "DCS Policies", href: "/dcs-policies", icon: FileText, description: "Browse DCS policies & procedures" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Search bar — prominent, center */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl group-focus-within:border-amber-500/20 transition-colors">
            <Search className="w-5 h-5 text-slate-500 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search statutes, rules, or ask a legal question..."
              className="w-full px-4 py-4 bg-transparent text-white placeholder-slate-600 outline-none text-[15px]"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 mr-4 text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded font-mono shrink-0">
              Ctrl+K
            </kbd>
          </div>
        </div>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </h2>
          <div className="space-y-1.5">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <action.icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{action.label}</p>
                  <p className="text-xs text-slate-600">{action.description}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent research */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recent Research
            </h2>
            <Link
              href="/chat"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            {recentSessions.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/chat?session=${session.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {session.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
                      <Clock className="w-3 h-3" />
                      {session.updatedAt}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No research sessions yet</p>
                <Link
                  href="/chat?new=true"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Start your first session
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Pinned / Favorites placeholder */}
          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Pinned Cards
            </h2>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-8 text-center">
              <Star className="w-6 h-6 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Pin bench cards for quick access during hearings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
