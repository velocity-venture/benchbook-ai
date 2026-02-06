"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Plus,
  Loader2,
  Clock,
  StickyNote,
  Lock,
  Unlock,
  Trash2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { caseTypeDisplay, caseStatusDisplay } from "@/lib/db";

interface CaseDetail {
  id: string;
  case_number: string;
  child_initials: string;
  child_age: number | null;
  case_type: string;
  status: string;
  allegation: string | null;
  filed_date: string | null;
  next_hearing: string | null;
  attorney: string | null;
  notes_count: number;
  created_at: string;
  updated_at: string;
}

interface CaseNote {
  id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface Hearing {
  id: string;
  hearing_type: string;
  hearing_date: string;
  start_time: string;
  duration_minutes: number;
  room: string;
  notes: string | null;
}

interface Document {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

type TabId = "overview" | "notes" | "hearings" | "documents";

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

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [newNote, setNewNote] = useState("");
  const [notePrivate, setNotePrivate] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const fetchCaseData = useCallback(async () => {
    const supabase = createClient();

    const { data: caseData } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseData) {
      setCaseDetail(caseData);

      const [notesRes, hearingsRes, docsRes] = await Promise.all([
        supabase
          .from("case_notes")
          .select("*")
          .eq("case_id", caseId)
          .order("created_at", { ascending: false }),
        supabase
          .from("hearings")
          .select("*")
          .eq("case_id", caseId)
          .order("hearing_date", { ascending: false }),
        supabase
          .from("documents")
          .select("*")
          .eq("case_id", caseId)
          .order("created_at", { ascending: false }),
      ]);

      if (notesRes.data) setNotes(notesRes.data);
      if (hearingsRes.data) setHearings(hearingsRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    }

    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !caseDetail) return;
    setSavingNote(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("case_notes").insert({
      case_id: caseId,
      user_id: user.id,
      content: newNote.trim(),
      is_private: notePrivate,
    });

    if (!error) {
      setNewNote("");
      await fetchCaseData();
    }

    setSavingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    const supabase = createClient();
    await supabase.from("case_notes").delete().eq("id", noteId);
    await fetchCaseData();
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Case not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/cases")}
        >
          Back to Cases
        </Button>
      </div>
    );
  }

  const displayType =
    caseTypeDisplay[caseDetail.case_type] || caseDetail.case_type;
  const displayStatus =
    caseStatusDisplay[caseDetail.status] || caseDetail.status;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: "Notes", count: notes.length },
    { id: "hearings", label: "Hearings", count: hearings.length },
    { id: "documents", label: "Documents", count: documents.length },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cases")}
          className="mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              {caseDetail.case_number}
            </h1>
            <Badge
              className={cn(
                "text-white",
                statusColors[displayStatus] || "bg-slate-600"
              )}
            >
              {displayStatus}
            </Badge>
            <Badge
              variant="outline"
              className={typeColors[displayType] || ""}
            >
              {displayType}
            </Badge>
          </div>
          <p className="text-slate-400">
            {caseDetail.child_initials}
            {caseDetail.child_age ? `, Age ${caseDetail.child_age}` : ""} &mdash;{" "}
            {caseDetail.allegation || "No allegation specified"}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Filed Date</p>
            <p className="text-sm font-medium text-white">
              {caseDetail.filed_date
                ? new Date(caseDetail.filed_date).toLocaleDateString()
                : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Next Hearing</p>
            <p className="text-sm font-medium text-white">
              {caseDetail.next_hearing
                ? new Date(caseDetail.next_hearing).toLocaleDateString()
                : "None scheduled"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Attorney</p>
            <p className="text-sm font-medium text-white">
              {caseDetail.attorney || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Notes</p>
            <p className="text-sm font-medium text-white">{notes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-white">Case Timeline</h3>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-700" />

                {caseDetail.filed_date && (
                  <TimelineItem
                    icon={<FileText className="w-3.5 h-3.5" />}
                    date={caseDetail.filed_date}
                    title="Case Filed"
                    description={`${displayType} petition filed — ${caseDetail.allegation || "No allegation"}`}
                  />
                )}

                {hearings.map((h) => (
                  <TimelineItem
                    key={h.id}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    date={h.hearing_date}
                    title={`${h.hearing_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Hearing`}
                    description={`${h.start_time} in ${h.room}${h.notes ? ` — ${h.notes}` : ""}`}
                  />
                ))}

                {notes.slice(0, 3).map((n) => (
                  <TimelineItem
                    key={n.id}
                    icon={<StickyNote className="w-3.5 h-3.5" />}
                    date={n.created_at}
                    title="Note Added"
                    description={
                      n.content.length > 100
                        ? n.content.slice(0, 100) + "..."
                        : n.content
                    }
                  />
                ))}

                {hearings.length === 0 && notes.length === 0 && !caseDetail.filed_date && (
                  <p className="text-sm text-slate-500 pl-4">
                    No timeline events yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
          {/* New Note */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Textarea
                placeholder="Add a case note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setNotePrivate(!notePrivate)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                  {notePrivate ? (
                    <>
                      <Lock className="w-4 h-4" /> Private
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" /> Visible
                    </>
                  )}
                </button>
                <Button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || savingNote}
                  className="gap-2"
                  size="sm"
                >
                  {savingNote ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          {notes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <StickyNote className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No notes yet. Add one above.</p>
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {note.is_private ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(note.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-400"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "hearings" && (
        <div className="space-y-4">
          {hearings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No hearings scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            hearings.map((h) => (
              <Card key={h.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {h.hearing_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(h.hearing_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {h.start_time} ({h.duration_minutes} min)
                        </span>
                        <span>{h.room}</span>
                      </div>
                      {h.notes && (
                        <p className="text-sm text-slate-500 mt-2">
                          {h.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/documents/new?case=${caseDetail.id}`}>
              <Button className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </Link>
          </div>
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No documents for this case.</p>
              </CardContent>
            </Card>
          ) : (
            documents.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <Card className="hover:border-amber-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="font-medium text-white">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        doc.status === "signed"
                          ? "border-emerald-500 text-emerald-400"
                          : doc.status === "pending_signature"
                            ? "border-yellow-500 text-yellow-400"
                            : "border-slate-500 text-slate-400"
                      )}
                    >
                      {doc.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TimelineItem({
  icon,
  date,
  title,
  description,
}: {
  icon: React.ReactNode;
  date: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex gap-3">
      <div className="absolute -left-6 w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex-1 pb-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{title}</p>
          <span className="text-xs text-slate-500">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
