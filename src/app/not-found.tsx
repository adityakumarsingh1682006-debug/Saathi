import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] flex items-center justify-center text-[#176B67] mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-[#19302F]">Page Not Found</h2>
      <p className="text-xs text-[#667A78] mt-1 max-w-sm">
        The requested healthcare record or navigation endpoint could not be located.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-4 py-2 rounded-xl bg-[#176B67] text-white text-xs font-semibold hover:bg-[#135855] transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
