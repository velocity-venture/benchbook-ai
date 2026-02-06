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
  Download,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { documentCategoryDisplay, documentStatusDisplay } from "@/lib/db";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  usageCount: number;
}

interface Document {
  id: string;
  name: string;
  template: string;
  case: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  Draft: { bg: "bg-slate-600", text: "text-slate-300", icon: Edit },
  "Pending Signature": { bg: "bg-yellow-600", text: "text-yellow-300", icon: AlertCircle },
  Signed: { bg: "bg-green-600", text: "text-green-300", icon: CheckCircle },
};

const categoryColors: Record<string, string> = {
  Orders: "border-blue-500 text-blue-400",
  Notices: "border-green-500 text-green-400",
  Petitions: "border-purple-500 text-purple-400",
  Findings: "border-orange-500 text-orange-400",
};

export default function DocumentsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "recent">("templates");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch templates and documents in parallel
      const [templatesRes, documentsRes] = await Promise.all([
        supabase
          .from("document_templates")
          .select("id, name, description, category, usage_count")
          .order("usage_count", { ascending: false }),
        supabase
          .from("documents")
          .select("id, name, template_id, case_number, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (templatesRes.data) {
        setTemplates(
          templatesRes.data.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description || "",
            category: documentCategoryDisplay[t.category] || t.category,
            usageCount: t.usage_count || 0,
          }))
        );
      }

      if (documentsRes.data) {
        setRecentDocuments(
          documentsRes.data.map((d) => ({
            id: d.id,
            name: d.name,
            template: d.template_id || "",
            case: d.case_number || "",
            status: documentStatusDisplay[d.status] || d.status,
            createdAt: new Date(d.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }))
        );
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(templates.map((t) => t.category))];

  // Compute stats from real data
  const pendingSignatureCount = recentDocuments.filter((d) => d.status === "Pending Signature").length;
  const signedCount = recentDocuments.filter((d) => d.status === "Signed").length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400">Generate and manage court documents</p>
        </div>
        <Link href="/documents/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Document
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === "templates"
              ? "border-amber-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === "recent"
              ? "border-amber-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          Recent Documents
        </button>
      </div>

      {activeTab === "templates" ? (
        <>
          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-amber-400" />
                    </div>
                    <Badge variant="outline" className={categoryColors[template.category]}>
                      {template.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.usageCount} uses
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/documents/new?template=${template.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Create
                      </Button>
                    </Link>
                    <Link href={`/documents/new?template=${template.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full p-8 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No templates found</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Recent Documents */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Document</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Case</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Created</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((doc) => {
                    const status = statusColors[doc.status] || statusColors["Draft"];
                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.template}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{doc.case || "—"}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={cn("gap-1", status.bg, status.text)}>
                            <status.icon className="w-3 h-3" />
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-400">{doc.createdAt}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/documents/${doc.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/documents/${doc.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/documents/${doc.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {recentDocuments.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No documents generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Documents", value: recentDocuments.length.toString(), icon: FileText },
          { label: "Pending Signature", value: pendingSignatureCount.toString(), icon: AlertCircle },
          { label: "Signed", value: signedCount.toString(), icon: CheckCircle },
          { label: "Templates Available", value: templates.length.toString(), icon: FolderOpen },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
