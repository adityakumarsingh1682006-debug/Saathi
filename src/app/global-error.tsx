"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7FAF8] text-[#19302F] p-8 flex items-center justify-center min-h-screen font-sans">
        <div className="max-w-md w-full p-6 bg-white rounded-2xl border border-[#7BAE9D]/30 shadow-md text-center space-y-4">
          <h2 className="text-xl font-bold text-[#19302F]">System Error</h2>
          <p className="text-xs text-[#667A78]">An unexpected application error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#176B67] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#135855] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
