"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Info,
  ShieldCheck,
  User,
  Sparkles,
  Loader2,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  Table,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { LabPanel } from "@/lib/medical/types";
import { MedicalRecord } from "@/lib/mock-data";
import { CLINICAL_REFERENCE_DATABASE } from "@/lib/medical/reference-data";
import { formatDeterministicDate } from "@/lib/date-utils";
import { MedicalReportSummary } from "@/lib/ai/report-summarizer";
import { useAppState } from "@/lib/store-context";
import { cn } from "@/lib/utils";

interface ReportDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: LabPanel | MedicalRecord | null;
}

export function ReportDetailModal({
  open,
  onOpenChange,
  report,
}: ReportDetailModalProps) {
  const { patient } = useAppState();

  const [activeTab, setActiveTab] = useState<"summary" | "breakdown">("breakdown");
  const [summaryData, setSummaryData] = useState<MedicalReportSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when report changes
  useEffect(() => {
    setSummaryData(null);
    setIsGenerating(false);
    setErrorMessage(null);
    setActiveTab("breakdown");
  }, [report?.id]);

  if (!report) return null;

  const isLabPanel = "analytes" in report;
  const panel = isLabPanel ? (report as LabPanel) : null;
  const record = !isLabPanel ? (report as MedicalRecord) : null;

  const reportTitle = panel ? panel.title : record?.title || "Clinical Document";
  const facility = panel ? panel.facility : record?.facility || "Diagnostic Facility";
  const dateStr = panel ? panel.reportedDate.split("T")[0] : record?.date || "";
  const doctor = panel ? panel.pathologist : record?.doctorName || "Attending Physician";

  // Determine overall status
  const abnormalAnalytes = panel
    ? panel.analytes.filter((a) => a.status === "Elevated" || a.status === "Low" || a.status === "Critical")
    : [];

  const overallStatus: "Normal" | "Needs Attention" | "Awaiting Review" = panel
    ? abnormalAnalytes.length > 0
      ? "Needs Attention"
      : "Normal"
    : record?.blockchainAnchored
    ? "Normal"
    : "Awaiting Review";

  const getStatusBadge = (status: "Normal" | "Needs Attention" | "Awaiting Review") => {
    switch (status) {
      case "Normal":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Normal
          </span>
        );
      case "Needs Attention":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Needs Attention
          </span>
        );
      case "Awaiting Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Awaiting Review
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setActiveTab("summary");

    try {
      // Prepare report data for server API
      const analytesPayload = panel
        ? panel.analytes.map((a) => ({
            name: a.name,
            value: a.result,
            unit: a.unit,
            referenceRange: {
              textual: a.referenceRange.text,
            },
            status: a.status,
            description: a.methodology,
          }))
        : [];

      const findingsPayload = record?.clinicalDetails?.findings || (panel?.summaryNote ? [panel.summaryNote] : []);

      const payload = {
        reportId: report.id,
        patientDid: patient.did || "did:saathi:sep:0x9F64A810928B8d9a2217cCd6498F2817e01239Aa",
        reportData: {
          reportId: report.id,
          title: reportTitle,
          facility,
          doctorName: doctor,
          date: dateStr,
          category: panel?.panelType || record?.category || "lab",
          analytes: analytesPayload,
          findings: findingsPayload,
        },
      };

      const res = await fetch("/api/records/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to generate report summary");
      }

      setSummaryData(json.summary);
    } catch (err: any) {
      console.error("Summary generation error:", err);
      setErrorMessage(err.message || "Could not generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-white border-[#7BAE9D]/30 p-6 text-left">
        {/* HEADER */}
        <DialogHeader className="space-y-2 border-b border-[#7BAE9D]/20 pb-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#176B67] uppercase tracking-wider">
                  Patient Health Report
                </span>
                <DialogTitle className="text-lg font-bold text-[#19302F]">
                  {reportTitle}
                </DialogTitle>
              </div>
            </div>
            <div>{getStatusBadge(overallStatus)}</div>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#667A78] pt-1">
            <span className="flex items-center gap-1 text-[#19302F]">
              <Building2 className="w-3.5 h-3.5 text-[#176B67]" />
              <span className="font-semibold">{facility}</span>
            </span>
            <span className="flex items-center gap-1 text-[#19302F]">
              <User className="w-3.5 h-3.5 text-[#176B67]" />
              <span>{doctor}</span>
            </span>
            <span className="flex items-center gap-1 text-[#19302F]">
              <Calendar className="w-3.5 h-3.5 text-[#176B67]" />
              <span>{formatDeterministicDate(dateStr)}</span>
            </span>
          </div>
        </DialogHeader>

        {/* PROMINENT AI SUMMARY GENERATION CTA */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E6F3EF] via-[#F7FAF8] to-[#E6F3EF] border border-[#7BAE9D]/35 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#176B67] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#19302F]">Gemini Medical Report Summary</h4>
                <Badge variant="outline" className="text-[10px] text-[#176B67] border-[#7BAE9D]/40 bg-white">
                  Plain English
                </Badge>
              </div>
              <p className="text-xs text-[#667A78] leading-tight mt-0.5">
                Understand test results, highlighted values, medical terms, and questions to ask your doctor.
              </p>
            </div>
          </div>

          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            size="sm"
            className="bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs h-9 px-4 rounded-xl gap-2 shrink-0 shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Report...</span>
              </>
            ) : summaryData ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate Summary</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate AI Summary</span>
              </>
            )}
          </Button>
        </div>

        {/* VIEW NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-[#7BAE9D]/20 pt-1 pb-2">
          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "breakdown"
                ? "bg-[#176B67] text-white shadow-xs"
                : "text-[#667A78] hover:bg-[#E6F3EF] hover:text-[#176B67]"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Test Breakdown & Reference Values</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("summary");
              if (!summaryData && !isGenerating) {
                handleGenerateSummary();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "summary"
                ? "bg-[#176B67] text-white shadow-xs"
                : "text-[#667A78] hover:bg-[#E6F3EF] hover:text-[#176B67]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Report Summary</span>
            {summaryData && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: AI REPORT SUMMARY (STRUCTURED GEMINI ANALYSIS)                    */}
        {/* ========================================================================= */}
        {activeTab === "summary" && (
          <div className="space-y-4 pt-1">
            {isGenerating && (
              <div className="p-8 rounded-2xl bg-[#F7FAF8] border border-[#7BAE9D]/30 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#176B67] mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#19302F]">
                    Gemini is Analyzing Your Medical Report
                  </h4>
                  <p className="text-xs text-[#667A78] max-w-md mx-auto">
                    Retrieving encrypted test markers, verifying clinical reference intervals, and generating plain-English explanations...
                  </p>
                </div>
              </div>
            )}

            {errorMessage && !isGenerating && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateSummary}
                  className="text-xs h-7 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            )}

            {summaryData && !isGenerating && (
              <div className="space-y-5">
                {/* 1. AI REPORT SUMMARY */}
                <div className="p-4 rounded-2xl bg-white border border-[#7BAE9D]/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#176B67] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#176B67]" />
                      AI Report Summary
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono",
                        summaryData.provider === "Gemini AI"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                          : "bg-[#F7FAF8] text-[#667A78] border-[#7BAE9D]/30"
                      )}
                    >
                      {summaryData.provider === "Gemini AI" ? "✓ " : ""}{summaryData.provider} ({summaryData.modelUsed})
                    </Badge>
                  </div>
                  <p className="text-sm text-[#19302F] leading-relaxed">
                    {summaryData.summary}
                  </p>
                </div>

                {/* 2. KEY FINDINGS */}
                {summaryData.keyFindings && summaryData.keyFindings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#7BAE9D]/25 space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#19302F] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Key Findings
                    </h5>
                    <ul className="space-y-2 text-xs text-[#19302F]">
                      {summaryData.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#176B67] mt-1.5 shrink-0" />
                          <span className="leading-snug">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. VALUES TO DISCUSS WITH YOUR DOCTOR */}
                {summaryData.valuesToDiscuss && summaryData.valuesToDiscuss.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-[#19302F] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Values to Discuss with Your Doctor
                      </h5>
                      <span className="text-[11px] text-[#667A78]">
                        {summaryData.valuesToDiscuss.length} flagged test {summaryData.valuesToDiscuss.length === 1 ? "value" : "values"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {summaryData.valuesToDiscuss.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-[#19302F]">{item.analyte}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#176B67]">{item.value}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#667A78] font-mono">
                            Standard Range: <span className="font-semibold text-[#19302F]">{item.referenceRange}</span>
                          </div>

                          <p className="text-xs text-[#19302F] leading-relaxed pt-0.5">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No out-of-range or high/low laboratory markers were detected in this report.</span>
                  </div>
                )}

                {/* 4. MEDICAL TERMS EXPLAINED */}
                {summaryData.medicalTermsExplained && summaryData.medicalTermsExplained.length > 0 && (
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#19302F] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#176B67]" />
                      Medical Terms Explained
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {summaryData.medicalTermsExplained.map((term, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-[#7BAE9D]/25 space-y-1 text-xs"
                        >
                          <span className="font-bold text-xs text-[#176B67] block">
                            {term.term}
                          </span>
                          <p className="text-[11px] text-[#667A78] leading-relaxed">
                            {term.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. QUESTIONS TO ASK YOUR DOCTOR */}
                {summaryData.questionsToAskDoctor && summaryData.questionsToAskDoctor.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#E6F3EF]/60 border border-[#7BAE9D]/30 space-y-2.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#19302F] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#176B67]" />
                      Questions to Ask Your Doctor
                    </h5>
                    <p className="text-[11px] text-[#667A78]">
                      Carry these specific questions into your next appointment with Dr. {doctor}:
                    </p>

                    <div className="space-y-2 text-xs">
                      {summaryData.questionsToAskDoctor.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-[#7BAE9D]/20 text-[#19302F] flex items-start gap-2"
                        >
                          <span className="font-bold text-[#176B67] text-[11px]">{idx + 1}.</span>
                          <span className="leading-snug font-medium">&ldquo;{q}&rdquo;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EDUCATIONAL DISCLAIMER */}
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-[11px] text-[#667A78] leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#176B67] shrink-0 mt-0.5" />
                  <span>{summaryData.educationalDisclaimer}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: STANDARD TEST BREAKDOWN & REFERENCE RANGES                        */}
        {/* ========================================================================= */}
        {activeTab === "breakdown" && (
          <div className="space-y-4 pt-1">
            {/* EDUCATIONAL & SAFETY NOTICE */}
            <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/25 flex items-start gap-2.5 text-xs">
              <Info className="w-4 h-4 text-[#176B67] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#667A78] leading-relaxed">
                <span className="font-bold text-[#19302F]">Understanding Laboratory Reference Values:</span>{" "}
                Reference intervals represent values established by {facility} for healthy populations. Minor variations
                are common and should be interpreted by your physician.
              </div>
            </div>

            {/* CLINICAL SUMMARY */}
            <div className="p-4 rounded-xl bg-[#E6F3EF]/50 border border-[#7BAE9D]/25 space-y-1.5 text-xs">
              <span className="font-bold text-[#176B67] uppercase text-[10px] tracking-wider">
                Clinical Overview
              </span>
              <p className="text-[#19302F] leading-relaxed text-xs">
                {panel ? panel.summaryNote : record?.summary || "Documentation securely encrypted and stored."}
              </p>
            </div>

            {/* PLAIN-ENGLISH TEST BREAKDOWN TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#19302F]">
                  Detailed Test Breakdown
                </h4>
                <span className="text-[11px] text-[#667A78]">
                  {panel ? `${panel.analytes.length} tests performed` : "Documented clinical findings"}
                </span>
              </div>

              {panel && (
                <div className="space-y-3">
                  {panel.analytes.map((analyte) => {
                    const ref = CLINICAL_REFERENCE_DATABASE[analyte.loincCode];
                    const isAbnormal = analyte.status !== "Normal";

                    return (
                      <div
                        key={analyte.id}
                        className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                          isAbnormal
                            ? "bg-amber-50/40 border-amber-200"
                            : "bg-white border-[#7BAE9D]/25 hover:border-[#176B67]/30"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-[#19302F]">{analyte.name}</span>
                            <div className="text-[10px] text-[#667A78] font-mono">
                              LOINC: {analyte.loincCode} • {analyte.methodology || "Standard Assay"}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] text-[#667A78] block">Your Result</span>
                              <span className="text-sm font-bold text-[#176B67]">
                                {analyte.result} <span className="text-xs font-normal text-[#667A78]">{analyte.unit}</span>
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                isAbnormal
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {analyte.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#7BAE9D]/15 text-[11px]">
                          <div>
                            <span className="text-[#667A78] font-semibold">Laboratory Reference Range:</span>{" "}
                            <span className="font-mono text-[#19302F]">{analyte.referenceRange.text}</span>
                          </div>
                          <div>
                            <span className="text-[#667A78] font-semibold">Reference Standard:</span>{" "}
                            <span className="text-[#19302F]">{analyte.sourceOfRange}</span>
                          </div>
                        </div>

                        {/* WHAT THIS MEANS SECTION */}
                        <div className="p-2.5 rounded-lg bg-white border border-[#7BAE9D]/20 text-[11px] space-y-1">
                          <span className="font-bold text-[#176B67] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            What this measures:
                          </span>
                          <p className="text-[#19302F] leading-relaxed">
                            {ref?.patientFriendlyExplanation ||
                              analyte.clinicalInterpretation ||
                              "This test measures a vital physiological parameter. Consult your doctor for individualized clinical guidance."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {record && (
                <div className="space-y-2">
                  {record.clinicalDetails.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-[#7BAE9D]/25 text-xs flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="font-medium text-[#19302F]">{finding}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECURITY & BLOCKCHAIN PROOF */}
        <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#667A78]">
          <div className="flex items-center gap-1.5 text-[#176B67]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Integrity:</span>
          </div>
          <span className="truncate max-w-[280px]">
            {record?.sha256Digest || "Verified on Sepolia Smart Contract Registry"}
          </span>
        </div>

        {/* FOOTER ACTIONS */}
        <DialogFooter className="pt-3 border-t border-[#7BAE9D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs border-[#7BAE9D]/35 text-[#176B67] gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "breakdown" ? (
              <Button
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="bg-[#176B67] hover:bg-[#135855] text-white text-xs font-bold gap-1.5 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Summary</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="bg-[#176B67] hover:bg-[#135855] text-white text-xs font-bold"
              >
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
