import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  tagline?: boolean;
}

export function SaathiLogo({
  size = "md",
  showText = true,
  className,
  textClassName,
  tagline = false,
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div className={cn("relative flex items-center justify-center shrink-0", iconSizes[size])}>
        {/* Ambient liquid glow behind the emblem */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#7BAE9D]/30 via-[#176B67]/20 to-[#E6F3EF]/60 blur-md opacity-90" />
        
        {/* Core emblem container */}
        <div className="relative w-full h-full rounded-xl bg-white border border-[#7BAE9D]/35 p-1.5 shadow-md flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="saathi-grad-1" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#176B67" />
                <stop offset="0.6" stopColor="#7BAE9D" />
                <stop offset="1" stopColor="#176B67" />
              </linearGradient>
              <linearGradient id="saathi-grad-2" x1="90" y1="10" x2="10" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7BAE9D" />
                <stop offset="1" stopColor="#176B67" />
              </linearGradient>
            </defs>

            {/* Hexagonal sovereign identity shield */}
            <path
              d="M50 8 L85 27 V63 L50 92 L15 63 V27 Z"
              stroke="url(#saathi-grad-1)"
              strokeWidth="5"
              strokeLinejoin="round"
              fill="rgba(230, 243, 239, 0.45)"
            />

            {/* Inner biometric medical cross */}
            <path
              d="M50 26 V74 M26 50 H74"
              stroke="url(#saathi-grad-2)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />

            {/* Intersecting cryptographic orbit node */}
            <circle
              cx="50"
              cy="50"
              r="14"
              stroke="#176B67"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="2 2"
            />
            
            {/* Core identity anchor dot */}
            <circle cx="50" cy="50" r="4.5" fill="#176B67" />
            <circle cx="85" cy="27" r="3.5" fill="#7BAE9D" />
            <circle cx="15" cy="27" r="3.5" fill="#7BAE9D" />
            <circle cx="50" cy="92" r="3.5" fill="#176B67" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className={cn("font-bold tracking-tight text-[#19302F] font-sans", textSizes[size], textClassName)}>
              SAATHI
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#E6F3EF] text-[#176B67] border border-[#7BAE9D]/30">
              DID
            </span>
          </div>
          {tagline && (
            <span className="text-[11px] text-[#667A78] font-medium tracking-tight">
              Your Health. Your Identity. Your Control.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
