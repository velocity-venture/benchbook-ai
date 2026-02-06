"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewCasePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    case_number: "",
    child_initials: "",
    child_age: "",
    case_type: "delinquent",
    allegation: "",
    filed_date: new Date().toISOString().split("T")[0],
    attorney: "",
    next_hearing: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.case_number.trim() || !form.child_initials.trim()) {
      setError("Case number and child initials are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("cases")
      .insert({
        user_id: user.id,
        case_number: form.case_number.trim(),
        child_initials: form.child_initials.trim().toUpperCase(),
        child_age: form.child_age ? parseInt(form.child_age) : null,
        case_type: form.case_type,
        status: "active",
        allegation: form.allegation.trim() || null,
        filed_date: form.filed_date || null,
        attorney: form.attorney.trim() || null,
        next_hearing: form.next_hearing || null,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        setError("A case with this number already exists.");
      } else {
        setError(insertError.message);
      }
      setSaving(false);
      return;
    }

    router.push(`/cases/${data.id}`);
  };

  const selectClass =
    "h-10 w-full px-3 rounded-lg border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cases")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">New Case</h1>
          <p className="text-slate-400">Create a new juvenile court case</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Case Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Case Number <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g., 2026-JV-0001"
                value={form.case_number}
                onChange={(e) => update("case_number", e.target.value)}
              />
            </div>

            {/* Child Info Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Child Initials <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g., J.D."
                  value={form.child_initials}
                  onChange={(e) => update("child_initials", e.target.value)}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Child Age
                </label>
                <Input
                  type="number"
                  placeholder="Age"
                  min={0}
                  max={21}
                  value={form.child_age}
                  onChange={(e) => update("child_age", e.target.value)}
                />
              </div>
            </div>

            {/* Case Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Case Type
              </label>
              <select
                value={form.case_type}
                onChange={(e) => update("case_type", e.target.value)}
                className={selectClass}
              >
                <option value="delinquent">Delinquent</option>
                <option value="dependent_neglect">Dependent/Neglect</option>
                <option value="unruly">Unruly</option>
              </select>
            </div>

            {/* Allegation */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Allegation
              </label>
              <Textarea
                placeholder="Describe the allegation..."
                value={form.allegation}
                onChange={(e) => update("allegation", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Filed Date
                </label>
                <Input
                  type="date"
                  value={form.filed_date}
                  onChange={(e) => update("filed_date", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Next Hearing
                </label>
                <Input
                  type="date"
                  value={form.next_hearing}
                  onChange={(e) => update("next_hearing", e.target.value)}
                />
              </div>
            </div>

            {/* Attorney */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Attorney
              </label>
              <Input
                placeholder="Attorney name"
                value={form.attorney}
                onChange={(e) => update("attorney", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cases")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Create Case
          </Button>
        </div>
      </form>
    </div>
  );
}
