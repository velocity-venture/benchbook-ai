"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { caseTypeDisplay, caseStatusDisplay } from "@/lib/db";
import Link from "next/link";

interface CaseItem {
  uuid: string;
  id: string;
  child: { initials: string; age: number };
  type: string;
  status: string;
  allegation: string;
  filedDate: string;
  nextHearing: string | null;
  attorney: string;
  notes: number;
}

const statusColors: Record<string, string> = {
  Active: "bg-emerald-600",
  "Pending Disposition": "bg-yellow-600",
  Review: "bg-blue-600",
  "Detention Review": "bg-red-600",
  Closed: "bg-slate-600",
};

const typeColors: Record<string, string> = {
  Delinquent: "border-red-500 text-red-400",
  "Dependent/Neglect": "border-purple-500 text-purple-400",
  Unruly: "border-orange-500 text-orange-400",
};

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCases(
          data.map((row) => ({
            uuid: row.id,
            id: row.case_number,
            child: {
              initials: row.child_initials,
              age: row.child_age || 0,
            },
            type: caseTypeDisplay[row.case_type] || row.case_type,
            status: caseStatusDisplay[row.status] || row.status,
            allegation: row.allegation || "",
            filedDate: row.filed_date || "",
            nextHearing: row.next_hearing || null,
            attorney: row.attorney || "",
            notes: row.notes_count || 0,
          }))
        );
      }
      setLoading(false);
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.child.initials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.allegation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || c.status === selectedStatus;
    const matchesType = !selectedType || c.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cases</h1>
          <p className="text-slate-400">Manage your juvenile court cases</p>
        </div>
        <Link href="/cases/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by case number, initials, or allegation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus || ""}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
                className="h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending Disposition">Pending Disposition</option>
                <option value="Review">Review</option>
                <option value="Detention Review">Detention Review</option>
                <option value="Closed">Closed</option>
              </select>
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Types</option>
                <option value="Delinquent">Delinquent</option>
                <option value="Dependent/Neglect">Dependent/Neglect</option>
                <option value="Unruly">Unruly</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Active", value: cases.filter((c) => c.status !== "Closed").length },
          { label: "Delinquent", value: cases.filter((c) => c.type === "Delinquent").length },
          { label: "Dependent/Neglect", value: cases.filter((c) => c.type === "Dependent/Neglect").length },
          { label: "Pending Review", value: cases.filter((c) => c.status.includes("Review")).length },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Case #</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Child</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Allegation</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Next Hearing</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((case_) => (
                      <tr
                        key={case_.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-white">{case_.id}</span>
                            {case_.notes > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {case_.notes} notes
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-white">
                              {case_.child.initials}
                            </div>
                            <div>
                              <p className="text-sm text-white">{case_.child.initials}</p>
                              <p className="text-xs text-slate-500">Age {case_.child.age}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={typeColors[case_.type]}>
                            {case_.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-300">{case_.allegation}</p>
                          <p className="text-xs text-slate-500">{case_.attorney}</p>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={cn(
                              "text-white",
                              statusColors[case_.status] || "bg-slate-600"
                            )}
                          >
                            {case_.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {case_.nextHearing ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span className="text-white">
                                {new Date(case_.nextHearing).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">&mdash;</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Link href={`/cases/${case_.uuid}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCases.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No cases found matching your criteria</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
