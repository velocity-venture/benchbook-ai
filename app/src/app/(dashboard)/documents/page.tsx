"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ChevronRight,
  Sparkles,
  File,
  X,
} from "lucide-react";

type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete";

interface ComplianceIssue {
  severity: "pass" | "warning" | "error";
  field: string;
  message: string;
}

export default function DocumentAnalyzerPage() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [score, setScore] = useState(0);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStatus("uploading");

    // Simulate upload
    setTimeout(() => {
      setStatus("analyzing");

      // Simulate analysis
      setTimeout(() => {
        setScore(78);
        setIssues([
          { severity: "pass", field: "Case Number Format", message: "Correctly formatted per AOC standards" },
          { severity: "pass", field: "Court Identification", message: "Proper court designation included" },
          { severity: "pass", field: "Judge Signature Line", message: "Signature block present and correctly positioned" },
          { severity: "warning", field: "Service Certification", message: "Certificate of service is present but missing the date of service" },
          { severity: "warning", field: "Statutory Citation", message: "References T.C.A. § 37-1-114 — verify this is the intended citation for the relief sought" },
          { severity: "error", field: "Party Identification", message: "Respondent's date of birth is missing — required for juvenile proceedings" },
          { severity: "error", field: "Guardian Ad Litem", message: "No GAL appointment reference — required when child's interests may conflict with parent's" },
        ]);
        setStatus("complete");
      }, 2000);
    }, 1000);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setScore(0);
    setIssues([]);
  };

  const severityConfig = {
    pass: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Pass" },
    warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Warning" },
    error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Error" },
  };

  const passCount = issues.filter((i) => i.severity === "pass").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;
  const errorCount = issues.filter((i) => i.severity === "error").length;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Document Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a court document to check compliance against AOC standards
        </p>
      </div>

      {status === "idle" && (
        /* Upload zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
            dragOver
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-white/[0.08] hover:border-white/[0.15] bg-white/[0.01]"
          }`}
        >
          <Upload
            className={`w-12 h-12 mx-auto mb-4 ${
              dragOver ? "text-amber-400" : "text-slate-600"
            }`}
          />
          <p className="text-slate-300 font-medium mb-2">
            Drop your document here
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Supports PDF, DOCX, and DOC files up to 10MB
          </p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <FileText className="w-4 h-4" />
            Browse Files
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {(status === "uploading" || status === "analyzing") && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <File className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-white font-medium mb-1">
            {status === "uploading" ? "Uploading..." : "Analyzing document..."}
          </p>
          <p className="text-sm text-slate-500">
            {status === "uploading"
              ? file?.name
              : "Checking compliance against AOC standards"}
          </p>
        </div>
      )}

      {status === "complete" && (
        <div className="space-y-6">
          {/* File info bar */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">{file?.name}</p>
                <p className="text-xs text-slate-500">
                  {((file?.size || 0) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Score */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Compliance Score
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> {passCount} pass
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <AlertTriangle className="w-3 h-3" /> {warnCount} warnings
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-3 h-3" /> {errorCount} errors
                </span>
              </div>
            </div>

            {/* Score bar */}
            <div className="relative h-3 bg-white/[0.05] rounded-full overflow-hidden mb-2">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                  score >= 90
                    ? "bg-emerald-500"
                    : score >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">{score}%</span>
              <span
                className={`text-sm font-medium ${
                  score >= 90
                    ? "text-emerald-400"
                    : score >= 70
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {score >= 90 ? "Excellent" : score >= 70 ? "Needs Review" : "Action Required"}
              </span>
            </div>
          </div>

          {/* Issues list */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Analysis Results
              </h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {issues.map((issue, i) => {
                const config = severityConfig[issue.severity];
                return (
                  <div key={i} className="px-6 py-4 flex items-start gap-3">
                    <config.icon className={`w-4 h-4 ${config.color} mt-0.5 shrink-0`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{issue.field}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{issue.message}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${config.bg} ${config.color} ${config.border} border shrink-0`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0e1a] rounded-xl font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all">
              <Download className="w-4 h-4" />
              Export Corrected Version
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
