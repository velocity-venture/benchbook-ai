"use client";

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
} from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with real data
const stats = [
  { name: "Active Cases", value: "47", icon: FolderOpen, change: "+3 this week" },
  { name: "Hearings Today", value: "8", icon: Calendar, change: "Next: 10:30 AM" },
  { name: "Pending Reviews", value: "12", icon: Clock, change: "5 due this week" },
  { name: "AI Queries Today", value: "24", icon: MessageSquare, change: "Up 15%" },
];

const upcomingHearings = [
  { id: 1, case: "2024-JV-0147", type: "Detention", time: "10:30 AM", child: "J.D." },
  { id: 2, case: "2024-JV-0203", type: "Disposition", time: "11:00 AM", child: "M.S." },
  { id: 3, case: "2024-JV-0198", type: "Review", time: "2:00 PM", child: "A.R." },
  { id: 4, case: "2024-JV-0211", type: "Preliminary", time: "3:30 PM", child: "T.W." },
];

const recentCases = [
  { id: "2024-JV-0211", child: "T.W.", status: "Active", lastAction: "Petition filed", date: "Today" },
  { id: "2024-JV-0203", child: "M.S.", status: "Pending", lastAction: "Awaiting disposition", date: "Yesterday" },
  { id: "2024-JV-0198", child: "A.R.", status: "Review", lastAction: "6-month review scheduled", date: "2 days ago" },
];

const alerts = [
  { type: "warning", message: "Detention review due in 2 days for J.D. (2024-JV-0147)" },
  { type: "info", message: "FERPA compliance report due end of month" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, Judge Eckel</h1>
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
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
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
              <CardTitle>Today's Docket</CardTitle>
              <CardDescription>Scheduled hearings for today</CardDescription>
            </div>
            <Link href="/docket">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
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
                      <p className="text-sm font-medium text-white">{hearing.case}</p>
                      <p className="text-xs text-slate-400">
                        {hearing.type} • {hearing.child}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{hearing.time}</Badge>
                </div>
              ))}
            </div>
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
                      <p className="text-sm font-medium text-white">{case_.id}</p>
                      <p className="text-xs text-slate-400">
                        {case_.child} • {case_.lastAction}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        case_.status === "Active"
                          ? "success"
                          : case_.status === "Pending"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {case_.status}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{case_.date}</p>
                  </div>
                </div>
              ))}
            </div>
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
