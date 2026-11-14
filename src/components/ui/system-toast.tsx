"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useAppState } from "@/lib/store-context";
import { cn } from "@/lib/utils";

export function SystemToast() {
  const { notice, clearNotice } = useAppState();

  if (!notice) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#C93C4B] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#176B67] shrink-0" />,
  };

  const borders = {
    success: "border-emerald-300 bg-white/95 text-emerald-900 shadow-md",
    error: "border-[#C93C4B]/35 bg-white/95 text-[#C93C4B] shadow-md",
    info: "border-[#7BAE9D]/40 bg-white/95 text-[#19302F] shadow-md",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-2xl text-xs font-medium max-w-md",
          borders[notice.type]
        )}
      >
        {icons[notice.type]}
        <div className="flex-1 font-medium">{notice.message}</div>
        <button
          onClick={clearNotice}
          className="p-1 rounded-md hover:bg-[#E6F3EF] text-[#667A78] hover:text-[#19302F] transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
