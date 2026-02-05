"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  FolderOpen,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { caseStatusDisplay, hearingTypeDisplay } from "@/lib/db";

interface DashboardStats {
  activeCases: number;
  hearingsToday: number;
  pendingReviews: number;
  totalDocuments: number;
}

interface UpcomingHearing {
  id: string;
  caseNumber: string;
  type: string;
  time: string;
  child: string;
}

interface RecentCase {
  id: string;
  caseNumber: string;
  child: string;
  status: string;
  allegation: string;
  updatedAt: string;
}

interface Alert {
  type: "warning" | "info";
  message: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    hearingsToday: 0,
    pendingReviews: 0,
    totalDocuments: 0,
  });
  const [upcomingHearings, setUpcomingHearings] = useState<UpcomingHearing[]>([]);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userName, setUserName] = useState("Judge");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient();

      // Get user name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];
        if (name) setUserName(name);
      }

      const today = new Date().toISOString().split("T")[0];

      // Fetch stats in parallel
      const [casesRes, hearingsTodayRes, reviewsRes, docsRes] = await Promise.all([
        supabase.from("cases").select("id", { count: "exact", head: true }).neq("status", "closed"),
        supabase.from("hearings").select("id", { count: "exact", head: true }).eq("hearing_date", today),
        supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .in("status", ["review", "detention_review"]),
        supabase.from("documents").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        activeCases: casesRes.count || 0,
        hearingsToday: hearingsTodayRes.count || 0,
        pendingReviews: reviewsRes.count || 0,
        totalDocuments: docsRes.count || 0,
      });

      // Fetch today's hearings
      const { data: hearingsData } = await supabase
        .from("hearings")
        .select("id, case_number, hearing_type, start_time, child_initials")
        .eq("hearing_date", today)
        .order("start_time", { ascending: true })
        .limit(4);

      if (hearingsData) {
        setUpcomingHearings(
          hearingsData.map((h) => ({
            id: h.id,
            caseNumber: h.case_number,
            type: hearingTypeDisplay[h.hearing_type] || h.hearing_type,
            time: h.start_time?.substring(0, 5) || "",
            child: h.child_initials || "",
          }))
        );
      }

      // Fetch recent cases
      const { data: casesData } = await supabase
        .from("cases")
        .select("id, case_number, child_initials, status, allegation, updated_at")
        .order("updated_at", { ascending: false })
        .limit(3);

      if (casesData) {
        setRecentCases(
          casesData.map((c) => ({
            id: c.id,
            caseNumber: c.case_number,
            child: c.child_initials,
            status: caseStatusDisplay[c.status] || c.status,
            allegation: c.allegation || "",
            updatedAt: formatRelativeDate(c.updated_at),
          }))
        );
      }

      // Fetch compliance alerts
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const { data: deadlines } = await supabase
        .from("compliance_deadlines")
        .select("deadline_type, description, due_date")
        .eq("completed", false)
        .lte("due_date", threeDaysFromNow.toISOString().split("T")[0])
        .order("due_date", { ascending: true })
        .limit(5);

      if (deadlines && deadlines.length > 0) {
        setAlerts(
          deadlines.map((d) => ({
            type: "warning" as const,
            message: `${d.deadline_type}: ${d.description || "Due " + d.due_date}`,
          }))
        );
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { name: "Active Cases", value: stats.activeCases.toString(), icon: FolderOpen, change: "" },
    { name: "Hearings Today", value: stats.hearingsToday.toString(), icon: Calendar, change: "" },
    { name: "Pending Reviews", value: stats.pendingReviews.toString(), icon: Clock, change: "" },
    { name: "Documents", value: stats.totalDocuments.toString(), icon: MessageSquare, change: "" },
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
          <h1 className="text-2xl font-bold text-white">Good morning, {userName}</h1>
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
            Ask AI Research
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                alert.type === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Hearings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Docket</CardTitle>
              <CardDescription>Scheduled hearings for today</CardDescription>
            </div>
            <Link href="/docket">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingHearings.length > 0 ? (
              <div className="space-y-3">
                {upcomingHearings.map((hearing) => (
                  <div
                    key={hearing.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white font-medium">
                        {hearing.time.split(":")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{hearing.caseNumber}</p>
                        <p className="text-xs text-slate-400">
                          {hearing.type} &bull; {hearing.child}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{hearing.time}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No hearings scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Cases</CardTitle>
              <CardDescription>Latest case activity</CardDescription>
            </div>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCases.length > 0 ? (
              <div className="space-y-3">
                {recentCases.map((case_) => (
                  <div
                    key={case_.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{case_.caseNumber}</p>
                        <p className="text-xs text-slate-400">
                          {case_.child} &bull; {case_.allegation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          case_.status === "Active"
                            ? "success"
                            : case_.status === "Pending Disposition"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {case_.status}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">{case_.updatedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No cases yet — create your first case to get started
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/chat">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer">
                <MessageSquare className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-medium text-white">Research TN Law</h3>
                <p className="text-xs text-slate-400 mt-1">Ask AI about T.C.A., case law, DCS policy</p>
              </div>
            </Link>
            <Link href="/documents?action=new&type=detention">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer">
                <FileText className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-medium text-white">Detention Order</h3>
                <p className="text-xs text-slate-400 mt-1">Generate a new detention order</p>
              </div>
            </Link>
            <Link href="/cases?action=new">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer">
                <FolderOpen className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-medium text-white">New Case</h3>
                <p className="text-xs text-slate-400 mt-1">Create a new case file</p>
              </div>
            </Link>
            <Link href="/docket">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer">
                <Calendar className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-medium text-white">Schedule Hearing</h3>
                <p className="text-xs text-slate-400 mt-1">Add hearing to your docket</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
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
