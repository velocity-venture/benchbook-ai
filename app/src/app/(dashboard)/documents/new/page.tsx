"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Eye,
  Save,
  Loader2,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { templateDefinitions, type TemplateField } from "@/lib/document-templates";
import { documentCategoryDisplay } from "@/lib/db";

interface Profile {
  full_name: string;
  title: string;
  county: string;
  settings: Record<string, string>;
}

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const caseId = searchParams.get("case");

  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateId);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [templatesRes, profileRes] = await Promise.all([
        supabase.from("document_templates").select("id, name, description, category").order("name"),
        supabase.from("profiles").select("full_name, title, county, settings").eq("id", user.id).single(),
      ]);

      if (templatesRes.data) {
        setTemplates(templatesRes.data.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || "",
          category: t.category,
        })));
      }

      if (profileRes.data) {
        setProfile({
          full_name: profileRes.data.full_name || "",
          title: profileRes.data.title || "Judge",
          county: profileRes.data.county || "",
          settings: (profileRes.data.settings as Record<string, string>) || {},
        });
      }

      // If case ID provided, pre-populate from case
      if (caseId) {
        const { data: caseData } = await supabase
          .from("cases")
          .select("case_number, child_initials, child_age, attorney")
          .eq("id", caseId)
          .single();
        if (caseData) {
          setFieldValues(prev => ({
            ...prev,
            case_number: caseData.case_number || "",
            child_initials: caseData.child_initials || "",
            child_age: caseData.child_age?.toString() || "",
            attorney: caseData.attorney || "",
          }));
        }
      }

      setLoading(false);
    };
    load();
  }, [caseId]);

  // Auto-populate fields when template is selected
  useEffect(() => {
    if (!selectedTemplate || !profile) return;
    const def = templateDefinitions[selectedTemplate];
    if (!def) return;

    const autoValues: Record<string, string> = {};
    for (const field of def.fields) {
      if (field.autoPopulate === "judge_name") autoValues[field.id] = profile.full_name;
      if (field.autoPopulate === "county") autoValues[field.id] = profile.county;
      if (field.autoPopulate === "court_name") autoValues[field.id] = profile.settings?.court_name || "";
      if (field.autoPopulate === "date_today") autoValues[field.id] = new Date().toISOString().split("T")[0];
    }
    setFieldValues(prev => ({ ...autoValues, ...prev }));
  }, [selectedTemplate, profile]);

  const updateField = useCallback((id: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const generatePreview = useCallback(() => {
    if (!selectedTemplate || !profile) return "";
    const def = templateDefinitions[selectedTemplate];
    if (!def) return "";
    return def.generate(fieldValues, profile);
  }, [selectedTemplate, fieldValues, profile]);

  const handleSave = async (status: "draft" | "pending_signature") => {
    if (!selectedTemplate || !profile) return;
    const def = templateDefinitions[selectedTemplate];
    if (!def) return;

    // Validate required fields
    const missing = def.fields.filter(f => f.required && !fieldValues[f.id]?.trim());
    if (missing.length > 0) {
      setError(`Required fields: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const content = def.generate(fieldValues, profile);
    const templateInfo = templates.find(t => t.id === selectedTemplate);

    // Look up case_id from case_number
    let caseUuid = caseId || null;
    if (!caseUuid && fieldValues.case_number) {
      const { data: caseRow } = await supabase
        .from("cases")
        .select("id")
        .eq("case_number", fieldValues.case_number)
        .single();
      if (caseRow) caseUuid = caseRow.id;
    }

    const { data, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        template_id: selectedTemplate,
        case_id: caseUuid,
        name: `${templateInfo?.name || selectedTemplate} — ${fieldValues.case_number || "No Case"}`,
        case_number: fieldValues.case_number || null,
        status,
        content,
        field_values: fieldValues,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push(`/documents/${data.id}`);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // Step 1: Template selection
  if (!selectedTemplate) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">New Document</h1>
            <p className="text-slate-400">Select a template to get started</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card
              key={t.id}
              className="hover:border-amber-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTemplate(t.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  <Badge variant="outline">{documentCategoryDisplay[t.category] || t.category}</Badge>
                </div>
                <h3 className="font-semibold text-white mb-1">{t.name}</h3>
                <p className="text-sm text-slate-400">{t.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Fill form + preview
  const def = templateDefinitions[selectedTemplate];
  const templateInfo = templates.find(t => t.id === selectedTemplate);

  if (!def) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-400">Template definition not found for &ldquo;{selectedTemplate}&rdquo;. Please select another template.</p>
        <Button className="mt-4" onClick={() => setSelectedTemplate(null)}>Back to Templates</Button>
      </div>
    );
  }

  const renderField = (field: TemplateField) => {
    const value = fieldValues[field.id] || "";

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => updateField(field.id, e.target.value)}
          className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ring-offset-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => updateField(field.id, e.target.checked ? "true" : "false")}
            className="rounded border-slate-700 bg-slate-900"
          />
          {field.label}
        </label>
      );
    }

    return (
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => updateField(field.id, e.target.value)}
        placeholder={field.placeholder}
      />
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{templateInfo?.name || "New Document"}</h1>
            <p className="text-slate-400">Fill in the details below</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            className="gap-2"
            onClick={() => handleSave("pending_signature")}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Save & Sign
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className={showPreview ? "grid gap-6 lg:grid-cols-2" : ""}>
        {/* Form */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {def.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Preview */}
        {showPreview && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Document Preview</h3>
              <div
                className="bg-white text-black p-8 rounded-lg shadow-inner min-h-[600px] text-sm"
                style={{ fontFamily: profile?.settings?.default_font || "Times New Roman, serif" }}
                dangerouslySetInnerHTML={{ __html: generatePreview() }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
