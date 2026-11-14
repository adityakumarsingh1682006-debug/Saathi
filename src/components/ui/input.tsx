import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-[#7BAE9D]/30 bg-white px-3 py-1 text-sm text-[#19302F] shadow-xs transition-all placeholder:text-[#667A78]/70 focus-visible:outline-none focus-visible:border-[#176B67] focus-visible:ring-2 focus-visible:ring-[#176B67]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
