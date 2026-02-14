"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  BookOpen,
  Scale,
  FileText,
  ArrowRight,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { tcaSections } from "@/lib/tca-data";
import ResearchPatterns from "@/components/research-patterns";

interface RecentSession {
  id: string;
  title: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("Judge");
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];
        if (name) setUserName(name);

        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("id, title, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (sessions) {
          setRecentSessions(
            sessions.map((s) => ({
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

  const quickQueries = [
    { q: "What are the grounds for detention of a juvenile?", label: "Detention Grounds" },
    { q: "What is the standard of proof for TPR?", label: "TPR Standard" },
    { q: "When must a detention hearing be held?", label: "Detention Hearing Timeline" },
    { q: "What are the dispositional options for a delinquent child?", label: "Delinquent Dispositions" },
    { q: "What is DCS required to do when a report of abuse is received?", label: "DCS Abuse Response" },
    { q: "What are the rules for discovery in juvenile proceedings?", label: "Discovery Rules" },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {userName}</h1>
          <p className="text-slate-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link href="/chat">
          <Button size="lg" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            New Research Session
          </Button>
        </Link>
      </div>

      {/* Recent Research Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Research</CardTitle>
            <CardDescription>Your latest research sessions</CardDescription>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link key={session.id} href={`/chat?session=${session.id}`}>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-sm font-medium text-white">{session.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {session.updatedAt}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No research sessions yet. Start your first one above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Research Patterns */}
      <ResearchPatterns />

      {/* Quick Start */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickQueries.map((item) => (
            <Link key={item.label} href={`/chat?q=${encodeURIComponent(item.q)}`}>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
                <h3 className="font-medium text-white text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-slate-400">{item.q}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse the Corpus */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Browse the Corpus</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/tca">
            <Card className="hover:border-blue-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Tennessee Code</h3>
                <p className="text-2xl font-bold text-blue-400 mb-1">{tcaSections.length}</p>
                <p className="text-xs text-slate-400">TCA sections</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/trjpp">
            <Card className="hover:border-orange-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Scale className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">TRJPP Rules</h3>
                <p className="text-2xl font-bold text-orange-400 mb-1">44</p>
                <p className="text-xs text-slate-400">Juvenile practice rules</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dcs-policies">
            <Card className="hover:border-green-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">DCS Policies</h3>
                <p className="text-2xl font-bold text-green-400 mb-1">25</p>
                <p className="text-xs text-slate-400">Department policies</p>
              </CardContent>
            </Card>
          </Link>
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
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
