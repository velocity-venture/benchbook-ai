"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  Edit,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  Pen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { documentStatusDisplay } from "@/lib/db";

interface DocumentData {
  id: string;
  name: string;
  template_id: string;
  case_number: string | null;
  case_id: string | null;
  status: string;
  content: string;
  field_values: Record<string, string>;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { bg: "bg-slate-600", text: "text-slate-300", icon: Edit },
  pending_signature: { bg: "bg-yellow-600", text: "text-yellow-300", icon: Clock },
  signed: { bg: "bg-green-600", text: "text-green-300", icon: CheckCircle },
};

export default function DocumentViewPage() {
  const params = useParams();
  const docId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [profile, setProfile] = useState<{ default_font?: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [docRes, profileRes] = await Promise.all([
        supabase.from("documents").select("*").eq("id", docId).single(),
        supabase.from("profiles").select("settings").eq("id", user.id).single(),
      ]);

      if (docRes.data) {
        setDoc(docRes.data as DocumentData);
      }
      if (profileRes.data?.settings) {
        setProfile(profileRes.data.settings as { default_font?: string });
      }
      setLoading(false);
    };
    load();
  }, [docId]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !doc) return;

    const font = profile?.default_font || "Times New Roman, serif";
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${doc.name}</title>
<style>
@page { margin: 1in; size: letter; }
body { font-family: ${font}; font-size: 13px; line-height: 1.6; color: #000; }
table { border-collapse: collapse; }
h2 { page-break-after: avoid; }
</style></head>
<body>${doc.content}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSign = async () => {
    if (!doc) return;
    setSigning(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("documents")
      .update({ status: "signed", signed_at: new Date().toISOString() })
      .eq("id", doc.id);

    if (!error) {
      setDoc({ ...doc, status: "signed", signed_at: new Date().toISOString() });
    }
    setSigning(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">Document not found</p>
        <Link href="/documents"><Button>Back to Documents</Button></Link>
      </div>
    );
  }

  const status = statusConfig[doc.status] || statusConfig.draft;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{doc.name}</h1>
              <Badge className={cn("gap-1", status.bg, status.text)}>
                <status.icon className="w-3 h-3" />
                {documentStatusDisplay[doc.status] || doc.status}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm">
              {doc.case_number && <>Case {doc.case_number} &middot; </>}
              Created {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {doc.signed_at && <> &middot; Signed {new Date(doc.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {doc.status === "draft" && (
            <Link href={`/documents/new?template=${doc.template_id}${doc.case_id ? "&case=" + doc.case_id : ""}`}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </Link>
          )}
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
          {doc.status !== "signed" && (
            <Button className="gap-2" onClick={handleSign} disabled={signing}>
              {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pen className="w-4 h-4" />}
              Mark as Signed
            </Button>
          )}
        </div>
      </div>

      {/* Document content */}
      <Card>
        <CardContent className="p-8">
          <div
            ref={printRef}
            className="bg-white text-black p-8 rounded-lg shadow-inner min-h-[800px] max-w-[8.5in] mx-auto"
            style={{ fontFamily: profile?.default_font || "Times New Roman, serif", fontSize: "13px", lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
